<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bulletin de Notes - {{ $student->user->first_name }} {{ $student->user->last_name }}</title>
    <style>
        @page { margin: 1cm; }
        body { font-family: 'DejaVu Sans', sans-serif; color: #1F2937; margin: 0; padding: 0; font-size: 11px; line-height: 1.4; }
        .header { display: table; width: 100%; border-bottom: 2px solid #334155; padding-bottom: 10px; margin-bottom: 20px; }
        .logo-box { display: table-cell; width: 15%; vertical-align: top; }
        .school-info { display: table-cell; width: 70%; text-align: center; vertical-align: top; }
        .school-name { font-size: 20px; font-weight: bold; color: #1e293b; margin: 0; text-transform: uppercase; }
        .school-extra { font-size: 10px; color: #64748b; margin-top: 5px; }
        
        .bulletin-title { text-align: center; margin: 15px 0; border: 1.5px solid #334155; padding: 8px; background: #f8fafc; font-size: 16px; font-weight: bold; text-transform: uppercase; border-radius: 4px; }
        
        .info-grid { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .info-cell { width: 50%; padding: 5px; border: 1px solid #e2e8f0; }
        .info-label { font-weight: bold; color: #64748b; width: 35%; display: inline-block; }
        .info-value { font-weight: bold; color: #1e293b; }

        .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .grades-table th { background: #1e293b; color: white; border: 1px solid #1e293b; padding: 8px 4px; font-size: 10px; text-transform: uppercase; }
        .grades-table td { border: 1px solid #cbd5e1; padding: 6px 4px; text-align: center; }
        .subject-name { text-align: left !important; font-weight: bold; padding-left: 10px !important; }

        .summary-section { width: 100%; display: table; margin-top: 10px; }
        .performance-box { display: table-cell; width: 60%; border: 1px solid #cbd5e1; vertical-align: top; padding: 10px; border-radius: 4px; }
        .stats-table { width: 100%; border-collapse: collapse; }
        .stats-table td { padding: 4px 0; border-bottom: 1px dashed #e2e8f0; }

        .observation-box { display: table-cell; width: 35%; padding-left: 5%; vertical-align: top; }
        .obs-title { font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
        .obs-content { min-height: 60px; border: 1px solid #e2e8f0; padding: 10px; background: #fff; }

        .signatures { width: 100%; margin-top: 40px; }
        .sig-box { width: 33%; text-align: center; vertical-align: top; }
        .sig-label { font-weight: bold; margin-bottom: 40px; display: block; }
        .stamp { position: relative; }
        .stamp img { max-width: 100px; opacity: 0.7; }
        
        .footer { position: fixed; bottom: 0; width: 100%; font-size: 8px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 5px; }
    </style>
</head>
<body>

<div class="header">
    <div class="logo-box">
        @if($tenant->logo_url)
            <img src="{{ $tenant->logo_url }}" style="max-width: 80px;">
        @endif
    </div>
    <div class="school-info">
        <h1 class="school-name">{{ $tenant->name }}</h1>
        <div class="school-extra">
            {{ $tenant->address ?? 'République du Bénin' }}<br>
            Tél: {{ $tenant->phone ?? '+(229) 11 22 33 44' }} | Email: {{ $tenant->email ?? 'contact@ecole.bj' }}<br>
            <i>Espace Éducatif d'Excellence</i>
        </div>
    </div>
    <div class="logo-box" style="text-align: right;">
        <div style="font-weight: bold; font-size: 14px;">ANNÉE SCOLAIRE</div>
        <div style="font-size: 12px;">{{ now()->year }}/{{ now()->year + 1 }}</div>
    </div>
</div>

<div class="bulletin-title">
    Bulletin de Notes du {{ $term }}{{ $term == 1 ? 'er' : 'ème' }} Trimestre
</div>

<table class="info-grid">
    <tr>
        <td class="info-cell">
            <span class="info-label">NOM & PRÉNOMS:</span>
            <span class="info-value">{{ strtoupper($student->user->last_name) }} {{ $student->user->first_name }}</span>
        </td>
        <td class="info-cell">
            <span class="info-label">MATRICULE:</span>
            <span class="info-value">{{ $student->matricule }}</span>
        </td>
    </tr>
    <tr>
        <td class="info-cell">
            <span class="info-label">CLASSE:</span>
            <span class="info-value">{{ $student->schoolClass->name }}</span>
        </td>
        <td class="info-cell">
            <span class="info-label">EFFECTIF:</span>
            <span class="info-value">{{ $classSize }} Élèves</span>
        </td>
    </tr>
</table>

<table class="grades-table">
    <thead>
        <tr>
            <th style="width: 25%;">MATIÈRES</th>
            <th style="width: 8%;">COEFF</th>
            <th style="width: 10%;">NOTE / 20</th>
            <th style="width: 12%;">NOTE PONDÉRÉE</th>
            <th style="width: 15%;">ENSEIGNANT</th>
            <th style="width: 30%;">OBSERVATIONS</th>
        </tr>
    </thead>
    <tbody>
        @foreach($grades as $g)
        <tr>
            <td class="subject-name">{{ $g['subject'] }}</td>
            <td>{{ number_format($g['coeff'], 1) }}</td>
            <td style="font-weight: bold;">{{ number_format($g['avg'], 2) }}</td>
            <td style="background: #f1f5f9;">{{ number_format($g['total'], 2) }}</td>
            <td style="font-size: 9px;">{{ $g['teacher'] }}</td>
            <td style="text-align: left; font-size: 9px; font-style: italic;">{{ $g['comment'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<div class="summary-section">
    <div class="performance-box">
        <h3 style="margin-top: 0; font-size: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">RÉSUMÉ DES PERFORMANCES</h3>
        <table class="stats-table">
            <tr>
                <td>Total des coefficients :</td>
                <td style="text-align: right; font-weight: bold;">{{ $totalCoeff }}</td>
            </tr>
            <tr>
                <td>Total des points obtenus :</td>
                <td style="text-align: right; font-weight: bold;">{{ number_format($totalPoints, 2) }}</td>
            </tr>
            <tr>
                <td style="font-size: 12px; font-weight: bold;">MOYENNE DU TRIMESTRE :</td>
                <td style="text-align: right; font-size: 14px; color: #1e40af; font-weight: 900;">{{ number_format($generalAvg, 2) }} / 20</td>
            </tr>
            <tr>
                <td>Moyenne de la classe :</td>
                <td style="text-align: right;">{{ number_format($classAvg, 2) }} / 20</td>
            </tr>
            <tr>
                <td>RANG DANS LA CLASSE :</td>
                <td style="text-align: right; font-weight: bold;">{{ $rank }}{{ $rank == 1 ? 'er' : 'ème' }} / {{ $classSize }}</td>
            </tr>
        </table>
    </div>
    
    <div class="observation-box">
        <div class="obs-title">Appréciation de l'Établissement</div>
        <div class="obs-content">
            @if($generalAvg >= 16)
                EXCELLENT TRAVAIL. Félicitations du conseil.
            @elseif($generalAvg >= 14)
                TRÈS BON TRAVAIL. Tableau d'honneur.
            @elseif($generalAvg >= 12)
                TRAVAIL ASSEZ BIEN. Continuez ainsi.
            @elseif($generalAvg >= 10)
                RÉSULTATS PASSABLES. Peut mieux faire.
            @else
                INSUFFISANT. Doit redoubler d'efforts.
            @endif
        </div>
    </div>
</div>

<table class="signatures">
    <tr>
        <td class="sig-box">
            <span class="sig-label">Le Titulaire</span>
        </td>
        <td class="sig-box">
            <span class="sig-label">Le Parent d'élève</span>
        </td>
        <td class="sig-box">
            <span class="sig-label">Le Chef d'Établissement</span>
            <div class="stamp">
                @if($tenant->seal_url)
                    <img src="{{ $tenant->seal_url }}">
                @endif
                <div style="font-style: italic; font-size: 9px; margin-top: 5px;">Fait à {{ $tenant->address ?? 'Cotonou' }}, le {{ $date }}</div>
            </div>
        </td>
    </tr>
</table>

<div class="footer">
    Ce bulletin est généré numériquement par O-229 Education. Toute altération rend le document invalide.
</div>

</body>
</html>
