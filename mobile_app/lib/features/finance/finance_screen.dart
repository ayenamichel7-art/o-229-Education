import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';

final paymentsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  try {
    final res = await ref.read(dioProvider).get('/payments');
    return List<Map<String, dynamic>>.from(res.data['data'] ?? []);
  } on DioException {
    return [
      {'id': 1, 'student_name': 'Amara Diallo', 'amount': 150000, 'type': 'Scolarité', 'status': 'paid', 'date': '2026-03-01'},
      {'id': 2, 'student_name': 'Fatou Koné', 'amount': 150000, 'type': 'Scolarité', 'status': 'paid', 'date': '2026-03-02'},
      {'id': 3, 'student_name': 'Moussa Traoré', 'amount': 75000, 'type': 'Transport', 'status': 'pending', 'date': '2026-03-05'},
      {'id': 4, 'student_name': 'Awa Camara', 'amount': 150000, 'type': 'Scolarité', 'status': 'overdue', 'date': '2026-02-15'},
      {'id': 5, 'student_name': 'Ibrahim Sylla', 'amount': 50000, 'type': 'Cantine', 'status': 'paid', 'date': '2026-03-10'},
      {'id': 6, 'student_name': 'Kadia Bamba', 'amount': 150000, 'type': 'Scolarité', 'status': 'pending', 'date': '2026-03-08'},
    ];
  }
});

class FinanceScreen extends ConsumerWidget {
  const FinanceScreen({super.key});

  String _formatCFA(int amount) {
    final parts = <String>[];
    String s = amount.toString();
    for (int i = s.length; i > 0; i -= 3) {
      parts.insert(0, s.substring(i - 3 < 0 ? 0 : i - 3, i));
    }
    return '${parts.join(' ')} FCFA';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paymentsAsync = ref.watch(paymentsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Module Financier'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.download),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('🤖 Export PDF en cours...')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // KPI Cards Row
            SizedBox(
              height: 130,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _KpiFinanceCard(
                    title: 'Total Collecté',
                    value: _formatCFA(4250000),
                    icon: LucideIcons.wallet,
                    color: const Color(0xFF10B981),
                    trend: '+12%',
                  ),
                  _KpiFinanceCard(
                    title: 'Ce Mois',
                    value: _formatCFA(1200000),
                    icon: LucideIcons.trendingUp,
                    color: const Color(0xFF3B82F6),
                    trend: '+8%',
                  ),
                  _KpiFinanceCard(
                    title: 'En Attente',
                    value: _formatCFA(820000),
                    icon: LucideIcons.clock,
                    color: const Color(0xFFF59E0B),
                    trend: '-3%',
                  ),
                  _KpiFinanceCard(
                    title: 'En Retard',
                    value: _formatCFA(340000),
                    icon: LucideIcons.alertCircle,
                    color: const Color(0xFFEF4444),
                    trend: '+2%',
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            const Text(
              'Derniers Paiements',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            // Payments List
            paymentsAsync.when(
              loading: () => const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())),
              error: (err, _) => Center(child: Text('Erreur: $err')),
              data: (payments) {
                return Column(
                  children: payments.map((p) {
                    final status = p['status'] as String;
                    final statusConfig = _getStatusConfig(status);

                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2)),
                        ],
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        leading: CircleAvatar(
                          radius: 22,
                          backgroundColor: statusConfig['color'].withOpacity(0.1),
                          child: Icon(statusConfig['icon'] as IconData, color: statusConfig['color'] as Color, size: 20),
                        ),
                        title: Text(p['student_name'], style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Row(
                            children: [
                              Text(p['type'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                              const SizedBox(width: 8),
                              Text(p['date'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              _formatCFA(p['amount'] as int),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: (statusConfig['color'] as Color).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                statusConfig['label'] as String,
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: statusConfig['color'] as Color),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Map<String, dynamic> _getStatusConfig(String status) {
    switch (status) {
      case 'paid':
        return {'color': const Color(0xFF10B981), 'icon': LucideIcons.checkCircle, 'label': 'Payé'};
      case 'pending':
        return {'color': const Color(0xFFF59E0B), 'icon': LucideIcons.clock, 'label': 'En attente'};
      case 'overdue':
        return {'color': const Color(0xFFEF4444), 'icon': LucideIcons.alertCircle, 'label': 'En retard'};
      default:
        return {'color': Colors.grey, 'icon': LucideIcons.helpCircle, 'label': status};
    }
  }
}

class _KpiFinanceCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String trend;

  const _KpiFinanceCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    required this.trend,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 180,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: Icon(icon, color: color, size: 18),
              ),
              Text(trend, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
            ],
          ),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      ),
    );
  }
}
