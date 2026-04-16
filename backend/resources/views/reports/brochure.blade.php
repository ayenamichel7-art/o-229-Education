<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Brochure Scolaire - {{ $tenant->name }}</title>
    <style>
        @page { margin: 0; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1F2937; margin: 0; padding: 0; background-color: #f8fafc; }
        
        .hero { 
            background-color: {{ $reportSettings['primary_color'] ?? '#1E40AF' }}; 
            color: white; 
            padding: 60px 40px; 
            text-align: center;
            border-bottom: 8px solid {{ $reportSettings['secondary_color'] ?? '#F59E0B' }};
        }
        .school-logo { max-width: 120px; margin-bottom: 20px; border-radius: 15px; }
        .hero h1 { font-size: 36px; margin: 10px 0; letter-spacing: 1px; }
        .hero p { font-size: 18px; opacity: 0.9; font-style: italic; }

        .container { padding: 40px; }

        .section-title { 
            color: {{ $reportSettings['primary_color'] ?? '#1E40AF' }}; 
            border-left: 5px solid {{ $reportSettings['secondary_color'] ?? '#F59E0B' }}; 
            padding-left: 15px; 
            margin-bottom: 25px; 
            font-size: 22px;
            text-transform: uppercase;
        }

        .about-text { line-height: 1.8; color: #4B5563; font-size: 15px; margin-bottom: 40px; text-align: justify; }

        .class-grid { display: block; width: 100%; margin-bottom: 40px; }
        .class-card { 
            background: white; 
            border: 1px solid #E5E7EB; 
            border-radius: 12px; 
            padding: 20px; 
            margin-bottom: 15px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .class-name { font-weight: bold; font-size: 18px; color: {{ $reportSettings['primary_color'] ?? '#1E40AF' }}; }
        .class-details { color: #6B7280; font-size: 13px; margin-top: 5px; }

        .contact-box { 
            background-color: white; 
            border-top: 4px solid {{ $reportSettings['primary_color'] ?? '#1E40AF' }}; 
            padding: 30px; 
            border-radius: 15px;
            margin-top: 40px;
        }
        .contact-item { margin-bottom: 10px; font-size: 14px; }
        .contact-label { font-weight: bold; color: {{ $reportSettings['primary_color'] ?? '#1E40AF' }}; width: 100px; display: inline-block; }

        .footer { text-align: center; font-size: 12px; color: #9CA3AF; padding: 40px 0; }
    </style>
</head>
<body>

<div class="hero">
    @if($tenant->logo_url)
        <img src="{{ $tenant->logo_url }}" class="school-logo" alt="Logo">
    @endif
    <h1>{{ $tenant->name }}</h1>
    <p>{{ $tenant->tagline }}</p>
</div>

<div class="container">
    <div class="section-title">À Propos de Notre Établissement</div>
    <div class="about-text">
        {{ $tenant->description ?: "Bienvenue à " . $tenant->name . ". Notre établissement s'engage à fournir une éducation de qualité, centrée sur l'excellence académique et l'épanouissement personnel de chaque élève. Nous disposons d'une équipe pédagogique dévouée et d'un environnement d'apprentissage moderne." }}
    </div>

    <div class="section-title">Nos Classes & Formations</div>
    <div class="class-grid">
        @foreach($classes as $class)
        <div class="class-card">
            <div class="class-name">{{ $class->name }}</div>
            <div class="class-details">
                Niveau: {{ strtoupper($class->level) }} | Section: {{ $class->section }} | Capacité: {{ $class->capacity }} élèves
            </div>
        </div>
        @endforeach
    </div>

    <div class="contact-box">
        <div class="section-title" style="margin-top: 0;">Nous Contacter</div>
        <div class="contact-item"><span class="contact-label">Adresse:</span> {{ $tenant->address }}</div>
        <div class="contact-item"><span class="contact-label">Email:</span> {{ $tenant->email }}</div>
        <div class="contact-item"><span class="contact-label">Téléphone:</span> {{ $tenant->phone }}</div>
        
        @if($tenant->seal_url)
        <div style="text-align: right; margin-top: -40px; opacity: 0.6;">
            <img src="{{ $tenant->seal_url }}" style="max-width: 100px;">
            <p style="font-size: 10px; margin-top: 5px;">Cachet de l'établissement</p>
        </div>
        @endif
    </div>
</div>

<div class="footer">
    Document généré par @ {{ $tenant->name }} &copy; {{ now()->format('Y') }}.<br>
    Propulsé par o-229 Education.
</div>

</body>
</html>
