import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';

class CardManagementScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  const CardManagementScreen({super.key, required this.user});

  @override
  State<CardManagementScreen> createState() => _CardManagementScreenState();
}

class _CardManagementScreenState extends State<CardManagementScreen> {
  List<dynamic> _helpers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final result = await ApiService.getAdminHelpers();
    setState(() {
      _isLoading = false;
      _helpers = result['helpers'] as List? ?? [];
    });
  }

  Future<void> _revokeCard(Map<String, dynamic> helper) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Revoke Card & Suspend?', style: TextStyle(color: AppColors.textPrimary)),
        content: Text(
          'This will revoke ${helper['fullName']}\'s QR card and ban them from the society. This action cannot be undone easily.',
          style: const TextStyle(color: AppColors.textSecondary, height: 1.5),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary))),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('Revoke & Ban'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final id = helper['id'] as int? ?? 0;
    final result = await ApiService.revokeCard(id);
    if (!mounted) return;
    showSnack(context, result['success'] == true ? 'Card revoked for ${helper['fullName']}' : (result['message'] ?? 'Failed'), isError: result['success'] != true);
    if (result['success'] == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Helper Card Management'),
        actions: [IconButton(icon: const Icon(Icons.refresh_rounded), onPressed: _load)],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _helpers.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.credit_card_off_rounded, size: 56, color: AppColors.textMuted),
                      SizedBox(height: 16),
                      Text('No helpers registered', style: TextStyle(color: AppColors.textMuted, fontSize: 16)),
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _helpers.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, i) {
                    final h = _helpers[i] as Map<String, dynamic>;
                    final isBanned = h['accountStatus'] == 'BANNED';
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.card,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: isBanned ? AppColors.danger.withOpacity(0.3) : AppColors.border),
                      ),
                      child: Row(
                        children: [
                          UserAvatar(name: h['fullName'] as String?, radius: 24),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(h['fullName'] as String? ?? 'Helper', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 15)),
                                const SizedBox(height: 3),
                                if (h['qrCardId'] != null)
                                  Row(
                                    children: [
                                      const Icon(Icons.credit_card_rounded, size: 14, color: AppColors.textMuted),
                                      const SizedBox(width: 4),
                                      Text(h['qrCardId'] as String, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                                    ],
                                  ),
                                const SizedBox(height: 6),
                                StatusBadge(
                                  label: isBanned ? 'BANNED' : 'ACTIVE',
                                  color: isBanned ? AppColors.danger : AppColors.success,
                                ),
                              ],
                            ),
                          ),
                          if (!isBanned)
                            IconButton(
                              icon: const Icon(Icons.block_rounded, color: AppColors.danger, size: 22),
                              tooltip: 'Revoke Card',
                              onPressed: () => _revokeCard(h),
                            ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
