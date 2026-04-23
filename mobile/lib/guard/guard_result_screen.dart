import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';

class GuardResultScreen extends StatefulWidget {
  final Map<String, dynamic> visitor;
  final Map<String, dynamic> user;

  const GuardResultScreen({super.key, required this.visitor, required this.user});

  @override
  State<GuardResultScreen> createState() => _GuardResultScreenState();
}

class _GuardResultScreenState extends State<GuardResultScreen> {
  bool _isLoading = false;

  Future<void> _approveEntry() async {
    setState(() => _isLoading = true);
    final result = await ApiService.logEntry(
      visitorPhone: widget.visitor['phoneNumber'] ?? '',
      destinationFlat: widget.visitor['flatNumber'] ?? 'Unknown',
      verificationMethod: widget.visitor['qrVerified'] == true ? 'QR' : 'MANUAL',
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result['success'] == true) {
      showSnack(context, '✅ Entry Approved');
      Navigator.pop(context); // Go back to scanner
    } else {
      showSnack(context, result['message'] ?? 'Failed to log entry', isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isVerified = widget.visitor['qrVerified'] == true || widget.visitor['role'] != 'GUEST';
    final roleText = widget.visitor['role'] == 'HELPER' 
        ? 'Verified Support Staff' 
        : widget.visitor['role'] == 'RESIDENT' 
            ? 'Society Resident' 
            : 'Pre-Approved Guest';

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: Stack(
        children: [
          // Top Red Header
          Container(
            height: MediaQuery.of(context).size.height * 0.45,
            width: double.infinity,
            color: isVerified ? AppColors.success : AppColors.danger,
            child: SafeArea(
              child: Column(
                children: [
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const Spacer(),
                      const Icon(Icons.shield_rounded, color: Colors.white, size: 20),
                      const SizedBox(width: 8),
                      const Text('SAFENEST', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1)),
                      const Spacer(),
                      const SizedBox(width: 48),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    isVerified ? 'VERIFIED & AUTHORIZED ENTRY' : 'UNVERIFIED ENTRY',
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 1),
                  ),
                  const SizedBox(height: 20),
                  Icon(
                    isVerified ? Icons.check_circle_rounded : Icons.warning_rounded,
                    color: Colors.white,
                    size: 80,
                  ),
                ],
              ),
            ),
          ),

          // Content Card Overlapping
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: MediaQuery.of(context).size.height * 0.65,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.only(topLeft: Radius.circular(32), topRight: Radius.circular(32)),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                child: Column(
                  children: [
                    const SizedBox(height: 50), // Space for overlapping avatar
                    Text(
                      widget.visitor['fullName'] ?? 'Unknown User',
                      style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: (isVerified ? AppColors.success : AppColors.warning).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(isVerified ? Icons.verified_rounded : Icons.info_outline_rounded, 
                               color: isVerified ? AppColors.success : AppColors.warning, size: 16),
                          const SizedBox(width: 6),
                          Text(
                            roleText,
                            style: TextStyle(
                              color: isVerified ? AppColors.success : AppColors.warning,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    
                    const Divider(color: AppColors.border),
                    
                    const SizedBox(height: 24),
                    
                    // Details
                    Row(
                      children: [
                        const Icon(Icons.location_on_rounded, color: AppColors.textMuted, size: 24),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('DESTINATION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
                              const SizedBox(height: 4),
                              Text(
                                widget.visitor['flatNumber'] ?? 'Unknown Flat',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 24),

                    Row(
                      children: [
                        const Icon(Icons.phone_rounded, color: AppColors.textMuted, size: 24),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('PHONE NUMBER', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
                              const SizedBox(height: 4),
                              Text(
                                widget.visitor['phoneNumber'] ?? 'N/A',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {},
                            child: const Text('CALL RESIDENT'),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _approveEntry,
                            style: ElevatedButton.styleFrom(backgroundColor: isVerified ? AppColors.success : AppColors.primary),
                            child: _isLoading 
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('APPROVE ENTRY'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    TextButton(
                      onPressed: () {},
                      child: const Text('Flag Issue', style: TextStyle(color: AppColors.textMuted, decoration: TextDecoration.underline)),
                    )
                  ],
                ),
              ),
            ),
          ),

          // Overlapping Avatar
          Positioned(
            top: MediaQuery.of(context).size.height * 0.45 - 60,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: CircleAvatar(
                  radius: 56,
                  backgroundColor: AppColors.background,
                  backgroundImage: widget.visitor['profilePhotoUrl'] != null 
                      ? NetworkImage(widget.visitor['profilePhotoUrl'])
                      : null,
                  child: widget.visitor['profilePhotoUrl'] == null 
                      ? const Icon(Icons.person, size: 50, color: AppColors.textMuted)
                      : null,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
