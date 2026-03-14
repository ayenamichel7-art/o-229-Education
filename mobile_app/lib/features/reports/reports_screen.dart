import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';

final reportsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  try {
    final res = await ref.read(dioProvider).get('/reports');
    return List<Map<String, dynamic>>.from(res.data['data'] ?? []);
  } on DioException {
    return [
      {'id': 1, 'title': 'Rapport Financier — Mars 2026', 'type': 'Financier', 'generated_by': 'Robot Automatique', 'status': 'completed', 'created_at': '2026-03-10'},
      {'id': 2, 'title': 'Liste des Élèves par Classe', 'type': 'Académique', 'generated_by': 'Admin', 'status': 'completed', 'created_at': '2026-03-08'},
      {'id': 3, 'title': 'Rapport Présence — Semaine 10', 'type': 'Présence', 'generated_by': 'Robot Automatique', 'status': 'completed', 'created_at': '2026-03-07'},
      {'id': 4, 'title': 'Bilan Trimestriel Q1 2026', 'type': 'Analytique', 'generated_by': 'Robot Automatique', 'status': 'processing', 'created_at': '2026-03-12'},
      {'id': 5, 'title': 'Suivi Paiements Impayés', 'type': 'Financier', 'generated_by': 'Robot Automatique', 'status': 'scheduled', 'created_at': '2026-03-15'},
    ];
  }
});

class ReportsScreen extends ConsumerWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reportsAsync = ref.watch(reportsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Rapports & Robots'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.bot),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('🤖 Rapport planifié par le Robot !')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Robot Banner
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [const Color(0xFF8B5CF6).withOpacity(0.1), const Color(0xFF6366F1).withOpacity(0.1)],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.2)),
            ),
            child: const Row(
              children: [
                Text('🤖', style: TextStyle(fontSize: 28)),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Robots Automatiques Actifs',
                        style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF6366F1)),
                      ),
                      SizedBox(height: 4),
                      Text(
                        '3 robots surveillent votre établissement en continu.',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Reports List
          Expanded(
            child: reportsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Center(child: Text('Erreur: $err')),
              data: (reports) {
                return ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: reports.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final report = reports[index];
                    final status = report['status'] as String;
                    final sc = _getStatusConfig(status);

                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2)),
                        ],
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(LucideIcons.fileText, color: Color(0xFF6366F1), size: 22),
                        ),
                        title: Text(
                          report['title'],
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            'Par ${report['generated_by']} · ${report['created_at']}',
                            style: const TextStyle(fontSize: 11, color: Colors.grey),
                          ),
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: (sc['color'] as Color).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(sc['icon'] as IconData, size: 12, color: sc['color'] as Color),
                                  const SizedBox(width: 4),
                                  Text(
                                    sc['label'] as String,
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: sc['color'] as Color),
                                  ),
                                ],
                              ),
                            ),
                            if (status == 'completed') ...[
                              const SizedBox(height: 6),
                              const Icon(LucideIcons.download, size: 18, color: Color(0xFF3B82F6)),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Map<String, dynamic> _getStatusConfig(String status) {
    switch (status) {
      case 'completed':
        return {'color': const Color(0xFF10B981), 'icon': LucideIcons.checkCircle, 'label': 'Terminé'};
      case 'processing':
        return {'color': const Color(0xFF3B82F6), 'icon': LucideIcons.clock, 'label': 'En cours'};
      case 'scheduled':
        return {'color': const Color(0xFF8B5CF6), 'icon': LucideIcons.calendar, 'label': 'Planifié'};
      default:
        return {'color': Colors.grey, 'icon': LucideIcons.helpCircle, 'label': status};
    }
  }
}
