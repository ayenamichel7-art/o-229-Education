import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../auth/auth_provider.dart';
import 'package:go_router/go_router.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord ERP'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.logOut),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
              context.go('/login');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bonjour ${authState.user?['first_name'] ?? ''}',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text('Voici un résumé des KPIs de votre établissement.'),
            
            const SizedBox(height: 24),
            
            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: const [
                _KpiCard(title: 'Élèves Inscrits', value: '550', icon: LucideIcons.users, color: Colors.blue),
                _KpiCard(title: 'Professeurs', value: '32', icon: LucideIcons.userCheck, color: Colors.green),
                _KpiCard(title: 'Revenus Mensuels', value: '182k €', icon: LucideIcons.creditCard, color: Colors.orange),
                _KpiCard(title: 'Admissions', value: '14', icon: LucideIcons.userPlus, color: Colors.red),
              ],
            ),
            
            const SizedBox(height: 32),
            const Text('Activités Récentes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            
            // Placeholder for real Audit Trail list
            Card(
              child: ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFF1F5F9), child: Icon(LucideIcons.fileText)),
                title: const Text('Rapport financier généré'),
                subtitle: const Text('Par le Robot Automatique - Il y a 2h'),
                trailing: const Icon(LucideIcons.chevronRight),
                onTap: () {},
              )
            ),
            Card(
              child: ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFF1F5F9), child: Icon(LucideIcons.checkCircle)),
                title: const Text('Paiement reçu'),
                subtitle: const Text('Dossier #902, 1000€ - Il y a 4h'),
                trailing: const Icon(LucideIcons.chevronRight),
                onTap: () {},
              )
            ),
          ],
        ),
      ),

    );
  }
}

class _KpiCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _KpiCard({required this.title, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
              child: Icon(icon, color: color, size: 28),
            ),
            const Spacer(),
            Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            const SizedBox(height: 4),
            Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
