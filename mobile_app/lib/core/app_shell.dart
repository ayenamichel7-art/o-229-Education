import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../features/dashboard/dashboard_screen.dart';
import '../features/students/students_screen.dart';
import '../features/finance/finance_screen.dart';
import '../features/reports/reports_screen.dart';
import '../features/settings/settings_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    StudentsScreen(),
    FinanceScreen(),
    ReportsScreen(),
    SettingsScreen(),
  ];

  final List<String> _titles = const [
    'Accueil',
    'Élèves',
    'Finances',
    'Rapports',
    'Plus',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(13),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(5, (index) {
                final isActive = _currentIndex == index;
                final icons = [
                  LucideIcons.layoutDashboard,
                  LucideIcons.users,
                  LucideIcons.creditCard,
                  LucideIcons.fileBarChart,
                  LucideIcons.settings,
                ];

                return GestureDetector(
                  onTap: () => setState(() => _currentIndex = index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeInOut,
                    padding: EdgeInsets.symmetric(
                      horizontal: isActive ? 16 : 10,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: isActive
                          ? const Color(0xFF3B82F6).withAlpha(25)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          icons[index],
                          size: 21,
                          color: isActive ? const Color(0xFF3B82F6) : Colors.grey,
                        ),
                        if (isActive) ...[
                          const SizedBox(width: 6),
                          Text(
                            _titles[index],
                            style: const TextStyle(
                              color: Color(0xFF3B82F6),
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}
