import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';

class UserManagementScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  const UserManagementScreen({super.key, required this.user});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  List<dynamic> _pendingUsers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final result = await ApiService.getPendingUsers();
    setState(() {
      _isLoading = false;
      _pendingUsers = result['users'] as List? ?? [];
    });
  }

  Future<void> _approve(Map<String, dynamic> user) async {
    final id = user['id'] as int? ?? 0;
    final result = await ApiService.approveUser(id);
    if (!mounted) return;
    showSnack(context, result['success'] == true ? '${user['fullName']} approved' : (result['message'] ?? 'Failed'), isError: result['success'] != true);
    if (result['success'] == true) setState(() => _pendingUsers.remove(user));
  }

  Future<void> _ban(Map<String, dynamic> user) async {
    final id = user['id'] as int? ?? 0;
    final result = await ApiService.banUser(id);
    if (!mounted) return;
    showSnack(context, result['success'] == true ? '${user['fullName']} banned' : (result['message'] ?? 'Failed'), isError: result['success'] != true);
    if (result['success'] == true) setState(() => _pendingUsers.remove(user));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Pending Approvals${_pendingUsers.isNotEmpty ? ' (${_pendingUsers.length})' : ''}'),
        actions: [IconButton(icon: const Icon(Icons.refresh_rounded), onPressed: _load)],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _pendingUsers.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check_circle_outline_rounded, size: 64, color: AppColors.success),
                      SizedBox(height: 16),
                      Text('All caught up!', style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w700)),
                      SizedBox(height: 6),
                      Text('No pending user approvals.', style: TextStyle(color: AppColors.textMuted)),
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _pendingUsers.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, i) {
                    final u = _pendingUsers[i] as Map<String, dynamic>;
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.card,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              UserAvatar(name: u['fullName'] as String?, radius: 22),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(u['fullName'] as String? ?? 'Unknown', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 16)),
                                    Text(u['phoneNumber'] as String? ?? '', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                                    if (u['flatNumber'] != null)
                                      Text('Flat: ${u['flatNumber']}', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                                  ],
                                ),
                              ),
                              StatusBadge(label: 'PENDING', color: AppColors.warning),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () => _ban(u),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppColors.danger,
                                    side: const BorderSide(color: AppColors.danger),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                  child: const Text('Reject'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () => _approve(u),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.success,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                  child: const Text('Approve'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
