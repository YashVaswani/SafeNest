// Role-based shell — renders the correct tab navigator based on JWT role
import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../guard/guard_home.dart';
import '../guard/guard_log.dart';
import '../resident/resident_home.dart';
import '../resident/helpers_list.dart';
import '../resident/household.dart';
import '../admin/admin_overview.dart';
import '../admin/user_management.dart';
import '../admin/card_management.dart';

class RoleShell extends StatefulWidget {
  final String role;
  final Map<String, dynamic> user;
  const RoleShell({super.key, required this.role, required this.user});

  @override
  State<RoleShell> createState() => _RoleShellState();
}

class _RoleShellState extends State<RoleShell> {
  int _currentIndex = 0;

  List<Widget> get _pages {
    switch (widget.role) {
      case 'GUARD':
        return [
          GuardHomeScreen(user: widget.user),
          GuardLogScreen(user: widget.user),
        ];
      case 'ADMIN':
        return [
          AdminOverviewScreen(user: widget.user),
          UserManagementScreen(user: widget.user),
          CardManagementScreen(user: widget.user),
        ];
      case 'RESIDENT':
      default:
        return [
          ResidentHomeScreen(user: widget.user),
          HelpersListScreen(user: widget.user),
          HouseholdScreen(user: widget.user),
        ];
    }
  }

  List<BottomNavigationBarItem> get _navItems {
    switch (widget.role) {
      case 'GUARD':
        return const [
          BottomNavigationBarItem(icon: Icon(Icons.qr_code_scanner_rounded), label: 'Scanner'),
          BottomNavigationBarItem(icon: Icon(Icons.people_alt_rounded), label: 'In Society'),
        ];
      case 'ADMIN':
        return const [
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart_rounded), label: 'Overview'),
          BottomNavigationBarItem(icon: Icon(Icons.manage_accounts_rounded), label: 'Users'),
          BottomNavigationBarItem(icon: Icon(Icons.credit_card_rounded), label: 'Cards'),
        ];
      default:
        return const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.search_rounded), label: 'Helpers'),
          BottomNavigationBarItem(icon: Icon(Icons.family_restroom_rounded), label: 'Household'),
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = _pages;
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: pages),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.border, width: 0.5)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          items: _navItems,
        ),
      ),
    );
  }
}
