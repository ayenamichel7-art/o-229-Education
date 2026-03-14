<?php

namespace App\Console\Commands;

use App\Models\FormField;
use App\Models\FormTemplate;
use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportFluentForm extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-fluent-form {file : Path to the Fluent Form JSON export} {--tenant= : ID of the tenant (schema) to assign the form to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import a Fluent Form export JSON into o-229 FormTemplates and FormFields';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');

        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        $tenantId = $this->option('tenant');
        if (!$tenantId) {
            $tenant = Tenant::first();
            if (!$tenant) {
                $this->error("No tenant found. Please create a tenant first.");
                return 1;
            }
            $tenantId = $tenant->id;
        }

        $tenant = Tenant::find($tenantId);
        if (!$tenant) {
            $this->error("Tenant not found: {$tenantId}");
            return 1;
        }

        // Initialize Tenancy (switches to the tenant schema)
        tenancy()->initialize($tenant);

        $json = file_get_contents($filePath);
        $data = json_decode($json, true);

        if (!$data || !is_array($data)) {
            $this->error("Invalid JSON format.");
            return 1;
        }

        foreach ($data as $form) {
            $this->importForm($form);
        }

        $this->info("Import completed successfully in schema: " . $tenant->id);
        return 0;
    }

    protected function importForm(array $form)
    {
        $this->info("Importing form: {$form['title']}");

        DB::transaction(function () use ($form) {
            $template = FormTemplate::updateOrCreate(
                ['name' => $form['title']],
                [
                    'description' => $form['title'],
                    'is_active' => $form['status'] === 'published',
                    'academic_year_id' => 1,
                ]
            );

            // Delete existing fields to re-import
            $template->fields()->delete();

            $order = 0;
            $fields = data_get($form, 'form_fields.fields', []);

            foreach ($fields as $fieldData) {
                $this->processField($fieldData, $template, $order);
            }
        });
    }

    protected function processField(array $fieldData, FormTemplate $template, &$order, $section = 'general')
    {
        // Container handling (recursive)
        if ($fieldData['element'] === 'container') {
            $columns = data_get($fieldData, 'columns', []);
            foreach ($columns as $column) {
                $colFields = data_get($column, 'fields', []);
                foreach ($colFields as $colField) {
                    $this->processField($colField, $template, $order, $section);
                }
            }
            return;
        }

        if ($fieldData['element'] === 'input_name') {
            foreach (['first_name', 'last_name'] as $namePart) {
                $partData = data_get($fieldData, "fields.{$namePart}");
                if ($partData && data_get($partData, 'settings.visible')) {
                    $this->createField($template, $order, [
                        'label' => data_get($partData, 'settings.label'),
                        'name' => $namePart,
                        'type' => 'text',
                        'placeholder' => data_get($partData, 'attributes.placeholder'),
                        'is_required' => data_get($partData, 'settings.validation_rules.required.value', false),
                        'section' => 'student_info',
                    ]);
                }
            }
            return;
        }

        // Generic field handling
        $type = $this->mapType($fieldData['element']);
        if (!$type) {
            $this->warn("Skipping unknown element: {$fieldData['element']}");
            return;
        }

        $options = null;
        if (in_array($type, ['select', 'checkbox', 'radio'])) {
            $rawOptions = data_get($fieldData, 'settings.advanced_options', []);
            $options = collect($rawOptions)->pluck('label')->toArray();
            
            if ($fieldData['element'] === 'select_country' && empty($options)) {
                $options = ['Togo', 'Benin', 'Ghana', 'France', 'USA'];
            }
        }

        $label = data_get($fieldData, 'settings.label') ?: data_get($fieldData, 'settings.admin_field_label');
        if (!$label && $fieldData['element'] === 'input_file') {
            $label = data_get($fieldData, 'settings.btn_text');
        }

        $this->createField($template, $order, [
            'label' => $label ?: 'Unnamed Field',
            'name' => data_get($fieldData, 'attributes.name') ?: 'field_' . $order,
            'type' => $type,
            'placeholder' => data_get($fieldData, 'attributes.placeholder') ?: data_get($fieldData, 'settings.btn_text'),
            'is_required' => data_get($fieldData, 'settings.validation_rules.required.value', false),
            'options' => $options,
            'section' => $section,
        ]);
    }

    protected function createField(FormTemplate $template, &$order, array $attributes)
    {
        FormField::create(array_merge($attributes, [
            'form_template_id' => $template->id,
            'order' => $order++,
        ]));
    }

    protected function mapType($element)
    {
        return match ($element) {
            'input_text' => 'text',
            'input_email' => 'email',
            'input_number' => 'number',
            'input_date', 'datetime' => 'date',
            'select', 'select_country' => 'select',
            'input_checkbox' => 'checkbox',
            'input_radio' => 'radio',
            'textarea' => 'textarea',
            'input_file', 'input_image' => 'file',
            'phone' => 'tel',
            default => null,
        };
    }
}
