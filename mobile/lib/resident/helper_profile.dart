import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';

class HelperProfileScreen extends StatefulWidget {
  final String helperId;
  const HelperProfileScreen({super.key, required this.helperId});

  @override
  State<HelperProfileScreen> createState() => _HelperProfileScreenState();
}

class _HelperProfileScreenState extends State<HelperProfileScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _helper;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final result = await ApiService.getHelperProfile(widget.helperId);
    if (!mounted) return;
    if (result['success'] == true) {
      setState(() {
        _helper = result['helper'];
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
      showSnack(context, result['message'] ?? 'Failed to load profile', isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Support Staff Profile'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _helper == null
              ? const Center(child: Text('Profile not found'))
              : _buildProfile(),
    );
  }

  Widget _buildProfile() {
    final history = (_helper!['workHistory'] as List?) ?? [];
    
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Info Card
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundColor: AppColors.background,
                      backgroundImage: _helper!['profilePhotoUrl'] != null 
                          ? NetworkImage(_helper!['profilePhotoUrl']) 
                          : null,
                      child: _helper!['profilePhotoUrl'] == null 
                          ? const Icon(Icons.person, size: 36, color: AppColors.textMuted) 
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                _helper!['fullName'] ?? 'Unknown',
                                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                              ),
                              const SizedBox(width: 6),
                              const Icon(Icons.verified_rounded, color: AppColors.success, size: 18),
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Text('Verified by gated community', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.phone_android_rounded, size: 14, color: AppColors.textMuted),
                              const SizedBox(width: 4),
                              Text(_helper!['phoneNumber'] ?? 'N/A', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.work_rounded, size: 14, color: AppColors.textMuted),
                              const SizedBox(width: 4),
                              Text('Support Staff • QR Card: ${_helper!['qrCardId'] ?? 'None'}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.call, size: 16),
                          SizedBox(width: 6),
                          Text('Call'),
                        ],
                      ),
                    )
                  ],
                ),
                
                const SizedBox(height: 24),
                
                // Trust Stats Row
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.1)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _StatColumn(icon: Icons.favorite_rounded, label: 'Trusted by\n4 Societies', color: AppColors.primary),
                      _StatColumn(icon: Icons.verified_user_rounded, label: 'Verified\nPast Experience', color: AppColors.accent),
                      _StatColumn(icon: Icons.calendar_month_rounded, label: '5 Years\nExperience', color: AppColors.textPrimary),
                      _StatColumn(icon: Icons.schedule_rounded, label: 'Current Work\n2h / day', color: AppColors.textPrimary),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 12),
          
          // Work History Title
          Container(
            padding: const EdgeInsets.all(20),
            color: AppColors.surface,
            width: double.infinity,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Work History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                const SizedBox(height: 4),
                const Text('Verified work history, only viewable by neighbors within gated societies.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                
                const SizedBox(height: 24),
                
                if (history.isEmpty)
                  const Text('No verified work history found.', style: TextStyle(color: AppColors.textMuted))
                else
                  ...history.map((h) => _buildHistoryCard(h)),

                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Updated securely, and safely verified within gated communities.',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text('Report', style: TextStyle(color: AppColors.danger)),
                      )
                    ],
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryCard(dynamic h) {
    final name = h['user_name'] ?? 'Unknown User';
    final flat = h['flat_number'] ?? 'N/A';
    final isActive = h['status'] == 'ACTIVE';
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isActive ? AppColors.success.withValues(alpha: 0.1) : AppColors.background,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.apartment_rounded, color: isActive ? AppColors.success : AppColors.textMuted, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Whitefield Society', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                    if (isActive)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: AppColors.success, borderRadius: BorderRadius.circular(12)),
                        child: const Text('Currently Working', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                      )
                    else
                      const Text('Report', style: TextStyle(color: AppColors.danger, fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 4),
                Text('Support Staff • Flat $flat', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.check_circle_outline_rounded, size: 14, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Text('Employed by $name', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatColumn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _StatColumn({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 6),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.textSecondary, height: 1.3),
        ),
      ],
    );
  }
}
