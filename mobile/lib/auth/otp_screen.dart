import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';
import '../shell/role_shell.dart';

class OtpScreen extends StatefulWidget {
  final String phoneNumber;
  const OtpScreen({super.key, required this.phoneNumber});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _isLoading = false;
  int _resendCountdown = 30;

  @override
  void initState() {
    super.initState();
    _startCountdown();
    // Auto-focus first field
    WidgetsBinding.instance.addPostFrameCallback((_) => _focusNodes[0].requestFocus());
  }

  void _startCountdown() {
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted || _resendCountdown == 0) return;
      setState(() => _resendCountdown--);
      _startCountdown();
    });
  }

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }

  String get _otp => _controllers.map((c) => c.text).join();

  void _onChanged(int index, String value) {
    if (value.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }
    if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
    if (_otp.length == 6) _verify();
  }

  Future<void> _verify() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);

    final result = await ApiService.verifyOtp(widget.phoneNumber, _otp);

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result['success'] == true) {
      final token = result['token'] as String;
      final user = result['user'] as Map<String, dynamic>;

      await ApiService.saveToken(token);
      await ApiService.saveUser(user);

      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => RoleShell(role: user['role'] as String, user: user)),
        (route) => false,
      );
    } else {
      showSnack(context, result['message'] ?? 'Invalid OTP', isError: true);
      for (final c in _controllers) c.clear();
      _focusNodes[0].requestFocus();
    }
  }

  Future<void> _resend() async {
    final result = await ApiService.sendOtp(widget.phoneNumber);
    if (!mounted) return;
    if (result['success'] == true) {
      setState(() => _resendCountdown = 30);
      _startCountdown();
      final otp = result['otp'];
      showSnack(context, otp != null ? 'DEV OTP: $otp' : 'OTP resent');
    } else {
      showSnack(context, 'Failed to resend OTP', isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18), onPressed: () => Navigator.pop(context)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              const Text('Verify your number', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              RichText(
                text: TextSpan(
                  style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.5),
                  children: [
                    const TextSpan(text: 'We sent a 6-digit code to '),
                    TextSpan(text: widget.phoneNumber, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),

              const SizedBox(height: 48),

              // OTP boxes
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (i) => _OtpBox(
                  controller: _controllers[i],
                  focusNode: _focusNodes[i],
                  onChanged: (v) => _onChanged(i, v),
                )),
              ),

              const SizedBox(height: 36),

              if (_isLoading)
                const Center(child: CircularProgressIndicator(color: AppColors.primary))
              else
                PrimaryButton(text: 'Verify & Continue', onPressed: _otp.length == 6 ? _verify : null, icon: Icons.check_circle_outline),

              const SizedBox(height: 32),

              // Resend
              Center(
                child: _resendCountdown > 0
                    ? Text('Resend OTP in ${_resendCountdown}s', style: const TextStyle(color: AppColors.textMuted))
                    : GestureDetector(
                        onTap: _resend,
                        child: const Text(
                          'Resend OTP',
                          style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 15),
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OtpBox extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;
  const _OtpBox({required this.controller, required this.focusNode, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 58,
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Center(
        child: TextField(
          controller: controller,
          focusNode: focusNode,
          onChanged: onChanged,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(1)],
          style: const TextStyle(color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.w800),
          decoration: const InputDecoration(
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            contentPadding: EdgeInsets.zero,
            isDense: true,
          ),
        ),
      ),
    );
  }
}
