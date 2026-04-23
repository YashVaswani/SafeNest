import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';

class HouseholdScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  const HouseholdScreen({super.key, required this.user});

  @override
  State<HouseholdScreen> createState() => _HouseholdScreenState();
}

class _HouseholdScreenState extends State<HouseholdScreen> {
  // Helpers linked to this resident — loaded from work history
  List<dynamic> _helpers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    // In a real impl, we'd have a GET /api/resident/household endpoint.
    // For now, we fetch all helpers and filter by residentId == current user's id.
    final result = await ApiService.getHelpers();
    setState(() {
      _isLoading = false;
      // Show all for demo; in prod, filter to current user's linked helpers
      _helpers = result['helpers'] as List? ?? [];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Household')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _helpers.isEmpty
              ? _emptyState()
              : ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: _helpers.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (_, i) {
                    final h = _helpers[i] as Map<String, dynamic>;
                    return _HouseholdCard(
                      helper: h,
                      onRemove: () => _remove(h),
                    );
                  },
                ),
    );
  }

  Widget _emptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.family_restroom_rounded, size: 64, color: AppColors.textMuted),
          SizedBox(height: 16),
          Text('No helpers linked to your flat', style: TextStyle(color: AppColors.textMuted, fontSize: 16)),
          SizedBox(height: 6),
          Text('Use the Helper Directory to find and verify helpers.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
        ],
      ),
    );
  }

  Future<void> _remove(Map<String, dynamic> helper) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Remove Helper?', style: TextStyle(color: AppColors.textPrimary)),
        content: Text('Remove ${helper['fullName']} from your household?', style: const TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary))),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('Remove'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      // In prod: call DELETE /api/household/:workHistoryId
      setState(() => _helpers.remove(helper));
      if (mounted) showSnack(context, '${helper['fullName']} removed from household');
    }
  }
}

class _HouseholdCard extends StatelessWidget {
  final Map<String, dynamic> helper;
  final VoidCallback onRemove;
  const _HouseholdCard({required this.helper, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          UserAvatar(name: helper['fullName'] as String?, radius: 26),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(helper['fullName'] as String? ?? 'Helper', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 16)),
                const SizedBox(height: 3),
                Text(helper['phoneNumber'] as String? ?? '', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                const SizedBox(height: 6),
                StatusBadge(label: 'ACTIVE', color: AppColors.success),
              ],
            ),
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded, color: AppColors.textSecondary),
            color: AppColors.surfaceElevated,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            onSelected: (v) {
              if (v == 'remove') onRemove();
            },
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'remove', child: Text('Remove Helper', style: TextStyle(color: AppColors.danger))),
            ],
          ),
        ],
      ),
    );
  }
}
