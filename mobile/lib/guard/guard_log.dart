import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';

class GuardLogScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  const GuardLogScreen({super.key, required this.user});

  @override
  State<GuardLogScreen> createState() => _GuardLogScreenState();
}

class _GuardLogScreenState extends State<GuardLogScreen> {
  List<dynamic> _visitors = [];
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
      _visitors = result['visitors'] as List? ?? [];
    });
  }

  Future<void> _logExit(int logId) async {
    final result = await ApiService.logExit(logId);
    if (!mounted) return;
    showSnack(context, result['success'] == true ? 'Exit logged' : (result['message'] ?? 'Failed'), isError: result['success'] != true);
    _load();
  }

  Color _roleColor(String? role) {
    switch (role) {
      case 'HELPER': return AppColors.accent;
      case 'DELIVERY': return AppColors.warning;
      case 'RESIDENT': return AppColors.primary;
      default: return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('In Society${_visitors.isNotEmpty ? '  (${_visitors.length})' : ''}'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh_rounded), onPressed: _load),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _visitors.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.people_outline, color: AppColors.textMuted, size: 56),
                      SizedBox(height: 16),
                      Text('Nobody currently inside', style: TextStyle(color: AppColors.textMuted, fontSize: 16)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  color: AppColors.primary,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _visitors.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      final v = _visitors[i] as Map<String, dynamic>;
                      final role = v['visitorRole'] as String? ?? 'GUEST';
                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.card,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            UserAvatar(name: v['visitorName'] as String?, radius: 24),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(v['visitorName'] as String? ?? 'Unknown', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700)),
                                  const SizedBox(height: 3),
                                  Text('→ ${v['destinationFlat'] ?? '-'}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                                  const SizedBox(height: 6),
                                  StatusBadge(label: role, color: _roleColor(role)),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.logout_rounded, color: AppColors.danger, size: 20),
                              onPressed: () => _logExit(v['logId'] as int? ?? 0),
                              tooltip: 'Log Exit',
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
