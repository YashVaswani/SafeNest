import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';
import '../auth/phone_screen.dart';

class AdminOverviewScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  const AdminOverviewScreen({super.key, required this.user});

  @override
  State<AdminOverviewScreen> createState() => _AdminOverviewScreenState();
}

class _AdminOverviewScreenState extends State<AdminOverviewScreen> {
  Map<String, dynamic> _metrics = {};
  List<dynamic> _alerts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final metricsResult = await ApiService.getAdminOverview();
    final alertsResult = await ApiService.getAlerts();
    setState(() {
      _isLoading = false;
      _metrics = metricsResult['metrics'] as Map<String, dynamic>? ?? {};
      _alerts = alertsResult['alerts'] as List? ?? [];
    });
  }

  Future<void> _logout() async {
    await ApiService.logout();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const PhoneScreen()), (r) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Society Overview'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh_rounded), onPressed: _load),
          IconButton(icon: const Icon(Icons.logout_rounded, size: 20), onPressed: _logout),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: _load,
              color: AppColors.primary,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // Metrics Grid
                  const SectionHeader(title: 'Live Metrics'),
                  const SizedBox(height: 14),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.25,
                    children: [
                      MetricCard(title: 'Active Guards', value: '${_metrics['guards'] ?? 0}', icon: Icons.security_rounded, color: AppColors.primary),
                      MetricCard(title: 'Verified Helpers', value: '${_metrics['helpers'] ?? 0}', icon: Icons.people_rounded, color: AppColors.accent),
                      MetricCard(title: 'Residents', value: '${_metrics['residents'] ?? 0}', icon: Icons.home_rounded, color: AppColors.warning),
                      MetricCard(title: 'Open Alerts', value: '${_metrics['openAlerts'] ?? 0}', icon: Icons.warning_amber_rounded, color: AppColors.danger),
                    ],
                  ),

                  if ((_metrics['pendingApprovals'] as int? ?? 0) > 0) ...[
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.warning.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.warning.withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.pending_actions_rounded, color: AppColors.warning),
                          const SizedBox(width: 12),
                          Text(
                            '${_metrics['pendingApprovals']} resident accounts pending approval',
                            style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  ],

                  if (_alerts.isNotEmpty) ...[
                    const SizedBox(height: 28),
                    const SectionHeader(title: 'Active Alerts'),
                    const SizedBox(height: 12),
                    ..._alerts.take(5).map((a) {
                      final alert = a as Map<String, dynamic>;
                      final severity = alert['severity'] as String? ?? 'LOW';
                      final color = severity == 'SOS'
                          ? AppColors.danger
                          : severity == 'HIGH'
                              ? AppColors.warning
                              : AppColors.textSecondary;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: color.withOpacity(0.25)),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              severity == 'SOS' ? Icons.sos_rounded : Icons.warning_amber_rounded,
                              color: color,
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(alert['description'] as String? ?? '', style: const TextStyle(color: AppColors.textPrimary, fontSize: 14)),
                                ],
                              ),
                            ),
                            StatusBadge(label: severity, color: color),
                          ],
                        ),
                      );
                    }),
                  ],
                ],
              ),
            ),
    );
  }
}
