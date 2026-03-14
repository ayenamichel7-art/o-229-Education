import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';

final studentsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  try {
    final res = await ref.read(dioProvider).get('/students');
    return List<Map<String, dynamic>>.from(res.data['data'] ?? []);
  } on DioException {
    // Mock fallback
    return [
      {'id': 1, 'matricule': 'STU-2026-001', 'first_name': 'Amara', 'last_name': 'Diallo', 'grade': 'Sixième', 'status': 'active'},
      {'id': 2, 'matricule': 'STU-2026-002', 'first_name': 'Fatou', 'last_name': 'Koné', 'grade': 'Cinquième', 'status': 'active'},
      {'id': 3, 'matricule': 'STU-2026-003', 'first_name': 'Moussa', 'last_name': 'Traoré', 'grade': 'Quatrième', 'status': 'active'},
      {'id': 4, 'matricule': 'STU-2026-004', 'first_name': 'Awa', 'last_name': 'Camara', 'grade': 'Troisième', 'status': 'suspended'},
      {'id': 5, 'matricule': 'STU-2026-005', 'first_name': 'Ibrahim', 'last_name': 'Sylla', 'grade': 'Terminale', 'status': 'active'},
      {'id': 6, 'matricule': 'STU-2026-006', 'first_name': 'Mariam', 'last_name': 'Touré', 'grade': 'Seconde', 'status': 'active'},
      {'id': 7, 'matricule': 'STU-2026-007', 'first_name': 'Oumar', 'last_name': 'Bah', 'grade': 'Première', 'status': 'active'},
    ];
  }
});

class StudentsScreen extends ConsumerStatefulWidget {
  const StudentsScreen({super.key});

  @override
  ConsumerState<StudentsScreen> createState() => _StudentsScreenState();
}

class _StudentsScreenState extends ConsumerState<StudentsScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final studentsAsync = ref.watch(studentsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestion des Élèves'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.userPlus),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Formulaire d\'inscription bientôt disponible')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
              decoration: InputDecoration(
                hintText: 'Rechercher un élève...',
                prefixIcon: const Icon(LucideIcons.search, size: 20),
                filled: true,
                fillColor: const Color(0xFFF1F5F9),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),

          // Students List
          Expanded(
            child: studentsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Center(child: Text('Erreur: $err')),
              data: (students) {
                final filtered = students.where((s) {
                  final name = '${s['first_name']} ${s['last_name']} ${s['matricule']}'.toLowerCase();
                  return name.contains(_searchQuery);
                }).toList();

                return ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final student = filtered[index];
                    final isActive = student['status'] == 'active';
                    final initials = '${student['first_name'][0]}${student['last_name'][0]}';

                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        leading: CircleAvatar(
                          radius: 24,
                          backgroundColor: isActive
                              ? const Color(0xFF3B82F6).withOpacity(0.1)
                              : Colors.red.withOpacity(0.1),
                          child: Text(
                            initials,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: isActive ? const Color(0xFF3B82F6) : Colors.red,
                            ),
                          ),
                        ),
                        title: Text(
                          '${student['first_name']} ${student['last_name']}',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF3B82F6).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  student['grade'],
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF3B82F6), fontWeight: FontWeight.w500),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(student['matricule'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                        ),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isActive ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            isActive ? 'Actif' : 'Suspendu',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isActive ? Colors.green.shade700 : Colors.red.shade700,
                            ),
                          ),
                        ),
                        onTap: () {
                          // Navigate to student detail
                        },
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
}
