<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StudentController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Student::class, 'student');
    }

    /**
     * List students (paginated, searchable).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $students = Student::with(['user', 'schoolClass'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('user', fn($q) => $q
                    ->where('first_name', 'ILIKE', "%{$search}%")
                    ->orWhere('last_name', 'ILIKE', "%{$search}%")
                    ->orWhere('email', 'ILIKE', "%{$search}%")
                );
            })
            ->when($request->class_id, fn($q, $v) => $q->where('class_id', $v))
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return StudentResource::collection($students);
    }

    /**
     * Show a single student.
     */
    public function show(Student $student): StudentResource
    {
        return new StudentResource($student->load(['user', 'schoolClass', 'grades.subject', 'payments']));
    }

    /**
     * Store a new student + user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name'            => 'required|string|max:255',
            'last_name'             => 'required|string|max:255',
            'email'                 => 'required|email',
            'phone'                 => 'nullable|string|max:20',
            'date_of_birth'         => 'nullable|date',
            'gender'                => 'nullable|in:male,female,other',
            'address'               => 'nullable|string',
            'guardian_name'         => 'nullable|string|max:255',
            'guardian_phone'        => 'nullable|string|max:20',
            'guardian_email'        => 'nullable|email',
            'guardian_relationship' => 'nullable|string|max:50',
            'class_id'             => 'nullable|exists:school_classes,id',
            'academic_year_id'     => 'nullable|exists:academic_years,id',
        ]);

        // Create user account
        $user = \App\Models\User::create([
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'],
            'email'      => $validated['email'],
            'phone'      => $validated['phone'] ?? null,
            'password'   => bcrypt('changeme123'), // Temporary password
        ]);
        $user->assignRole('student');

        // Create student profile
        $student = Student::create([
            'user_id'               => $user->id,
            'matricule'             => $this->generateMatricule(),
            'date_of_birth'         => $validated['date_of_birth'] ?? null,
            'gender'                => $validated['gender'] ?? null,
            'address'               => $validated['address'] ?? null,
            'guardian_name'         => $validated['guardian_name'] ?? null,
            'guardian_phone'        => $validated['guardian_phone'] ?? null,
            'guardian_email'        => $validated['guardian_email'] ?? null,
            'guardian_relationship' => $validated['guardian_relationship'] ?? null,
            'class_id'             => $validated['class_id'] ?? null,
            'academic_year_id'     => $validated['academic_year_id'] ?? null,
            'enrollment_date'      => now(),
            'status'               => 'active',
        ]);

        return (new StudentResource($student->load('user')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update student.
     */
    public function update(Request $request, Student $student): StudentResource
    {
        $validated = $request->validate([
            'date_of_birth'         => 'nullable|date',
            'gender'                => 'nullable|in:male,female,other',
            'address'               => 'nullable|string',
            'guardian_name'         => 'nullable|string|max:255',
            'guardian_phone'        => 'nullable|string|max:20',
            'guardian_email'        => 'nullable|email',
            'guardian_relationship' => 'nullable|string|max:50',
            'class_id'             => 'nullable|exists:school_classes,id',
            'status'               => 'nullable|in:active,graduated,transferred,expelled',
        ]);

        $student->update($validated);

        return new StudentResource($student->fresh()->load('user'));
    }

    /**
     * Delete student.
     */
    public function destroy(Student $student): JsonResponse
    {
        $student->delete();

        return response()->json(['message' => 'Élève supprimé.']);
    }

    /**
     * Generate unique matricule.
     */
    protected function generateMatricule(): string
    {
        $year = now()->format('Y');
        $count = Student::withoutGlobalScopes()->count() + 1;

        return "O229-{$year}-" . str_pad($count, 5, '0', STR_PAD_LEFT);
    }
}
