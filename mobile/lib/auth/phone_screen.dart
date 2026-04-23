import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';
import 'otp_screen.dart';

class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> with SingleTickerProviderStateMixin {
  final _phoneController = TextEditingController();
  bool _isLoading = false;
  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length < 10) {
      showSnack(context, 'Enter a valid phone number', isError: true);
      return;
    }

    setState(() => _isLoading = true);

    // Format phone number
    final formatted = phone.startsWith('+') ? phone : '+91$phone';
    final result = await ApiService.sendOtp(formatted);

    setState(() => _isLoading = false);

    if (!mounted) return;

    if (result['success'] == true) {
      // In dev, show OTP from response if available
      if (result['otp'] != null) {
        showSnack(context, 'DEV: Your OTP is ${result['otp']}');
      } else {
        showSnack(context, 'OTP sent to $formatted');
      }

      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => OtpScreen(phoneNumber: formatted)),
      );
    } else {
      showSnack(context, result['message'] ?? 'Failed to send OTP', isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 48),

                // Logo
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppColors.primary.withOpacity(0.3), AppColors.accent.withOpacity(0.15)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.shield_rounded, size: 56, color: AppColors.primary),
                  ),
                ),
                const SizedBox(height: 28),

                // Title
                const Center(
                  child: Text(
                    'SafeNest',
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -1),
                  ),
                ),
                const SizedBox(height: 6),
                const Center(
                  child: Text(
                    'Your smart society security platform',
                    style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
                  ),
                ),

                const SizedBox(height: 64),

                const Text('Enter your mobile number', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                const SizedBox(height: 6),
                const Text('We\'ll send you a one-time verification code', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                const SizedBox(height: 28),

                // Phone input
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surfaceElevated,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                        decoration: const BoxDecoration(
                          border: Border(right: BorderSide(color: AppColors.border)),
                        ),
                        child: const Text('+91', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 16)),
                      ),
                      Expanded(
                        child: TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(10)],
                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, letterSpacing: 2, fontWeight: FontWeight.w600),
                          decoration: const InputDecoration(
                            hintText: '9876543210',
                            hintStyle: TextStyle(color: AppColors.textMuted, letterSpacing: 0, fontWeight: FontWeight.normal),
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          ),
                          onSubmitted: (_) => _sendOtp(),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                PrimaryButton(
                  text: 'Get OTP',
                  onPressed: _sendOtp,
                  isLoading: _isLoading,
                  icon: Icons.arrow_forward_rounded,
                ),

                const SizedBox(height: 40),

                // Info box
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                  ),
                  child: const Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.info_outline, color: AppColors.primary, size: 18),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Access to this app is limited to verified residents, guards, and staff of registered societies.',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.5),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
