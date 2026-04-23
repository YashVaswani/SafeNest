import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';
import '../auth/phone_screen.dart';
import 'pre_approval_screen.dart';

class ResidentHomeScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  const ResidentHomeScreen({super.key, required this.user});

  @override
  State<ResidentHomeScreen> createState() => _ResidentHomeScreenState();
}

class _ResidentHomeScreenState extends State<ResidentHomeScreen> {
  List<dynamic> _inSociety = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final result = await ApiService.getInSociety();
    setState(() {
      _isLoading = false;
      _inSociety = result['visitors'] as List? ?? [];
    });
  }

  Future<void> _logout() async {
    await ApiService.logout();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const PhoneScreen()), (r) => false);
  }

  @override
  Widget build(BuildContext context) {
    final name = widget.user['fullName'] as String? ?? 'Resident';
    final flat = widget.user['flatNumber'] as String? ?? '';

    return Scaffold(
      appBar: AppBar(
        title: const Text('SafeNest'),
        actions: [
          IconButton(icon: const Icon(Icons.logout_rounded, size: 20), onPressed: _logout),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.primary,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Greeting
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary.withOpacity(0.2), AppColors.accent.withOpacity(0.08)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primary.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  UserAvatar(name: name, radius: 28),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Welcome back,', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        Text(name, style: const TextStyle(color: AppColors.textPrimary, fontSize: 20, fontWeight: FontWeight.w800)),
                        if (flat.isNotEmpty)
                          Text('Flat $flat', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      ],
                    ),
                  ),
                  const Icon(Icons.shield_rounded, color: AppColors.primary, size: 32),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Quick Actions
            const SectionHeader(title: 'Quick Actions'),
            const SizedBox(height: 14),

            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PreApprovalScreen(user: widget.user))),
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: AppColors.accent.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.qr_code_rounded, color: AppColors.accent, size: 28),
                          SizedBox(height: 10),
                          Text('Pre-Approve Guest', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 14)),
                          SizedBox(height: 3),
                          Text('Generate a temp QR code', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: _load,
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.people_rounded, color: AppColors.primary, size: 28),
                          const SizedBox(height: 10),
                          const Text('In Society Now', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 14)),
                          const SizedBox(height: 3),
                          Text('${_inSociety.length} people inside', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 28),

            // In-society preview
            if (!_isLoading && _inSociety.isNotEmpty) ...[
              const SectionHeader(title: 'Currently Inside'),
              const SizedBox(height: 12),
              ..._inSociety.take(5).map((v) {
                final visitor = v as Map<String, dynamic>;
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      UserAvatar(name: visitor['visitorName'] as String?, radius: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(visitor['visitorName'] as String? ?? 'Unknown', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 14)),
                            Text('→ Flat ${visitor['destinationFlat'] ?? '-'}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                          ],
                        ),
                      ),
                      StatusBadge(
                        label: visitor['visitorRole'] as String? ?? 'GUEST',
                        color: _roleColor(visitor['visitorRole'] as String?),
                      ),
                    ],
                  ),
                );
              }),
            ] else if (_isLoading) ...[
              const Center(child: CircularProgressIndicator(color: AppColors.primary)),
            ],
          ],
        ),
      ),
    );
  }

  Color _roleColor(String? role) {
    switch (role) {
      case 'HELPER': return AppColors.accent;
      case 'DELIVERY': return AppColors.warning;
      default: return AppColors.textSecondary;
    }
  }
}
