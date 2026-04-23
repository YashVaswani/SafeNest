import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';

class PreApprovalScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  const PreApprovalScreen({super.key, required this.user});

  @override
  State<PreApprovalScreen> createState() => _PreApprovalScreenState();
}

class _PreApprovalScreenState extends State<PreApprovalScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  DateTime _validUntil = DateTime.now().add(const Duration(hours: 4));
  bool _isLoading = false;
  String? _generatedCode;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();

    if (name.isEmpty || phone.length < 10) {
      showSnack(context, 'Enter a valid name and phone number', isError: true);
      return;
    }

    setState(() => _isLoading = true);

    final result = await ApiService.preApprove(
      visitorName: name,
      visitorPhone: phone.startsWith('+') ? phone : '+91$phone',
      validFrom: DateTime.now().toIso8601String(),
      validUntil: _validUntil.toIso8601String(),
    );

    setState(() => _isLoading = false);

    if (!mounted) return;

    if (result['success'] == true) {
      setState(() => _generatedCode = result['qrCodeValue'] as String?);
    } else {
      showSnack(context, result['message'] ?? 'Failed to create pre-approval', isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pre-Approve Guest')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: _generatedCode != null ? _successView() : _formView(),
      ),
    );
  }

  Widget _formView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Guest Details', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        const SizedBox(height: 6),
        const Text('Generate a QR code to share with your guest via WhatsApp.', style: TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.5)),

        const SizedBox(height: 32),

        const Text('Guest Name', style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        TextField(controller: _nameController, decoration: const InputDecoration(hintText: 'Full name')),

        const SizedBox(height: 20),

        const Text('Guest Phone Number', style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(hintText: '9876543210', prefixText: '+91 '),
        ),

        const SizedBox(height: 20),

        const Text('Valid Until', style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: _validUntil,
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 30)),
              builder: (_, child) => Theme(
                data: ThemeData.dark().copyWith(colorScheme: const ColorScheme.dark(primary: AppColors.primary)),
                child: child!,
              ),
            );
            if (date != null) {
              setState(() => _validUntil = DateTime(date.year, date.month, date.day, _validUntil.hour, _validUntil.minute));
            }
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: BoxDecoration(
              color: AppColors.surfaceElevated,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                const Icon(Icons.calendar_today_rounded, color: AppColors.primary, size: 18),
                const SizedBox(width: 12),
                Text(
                  '${_validUntil.day}/${_validUntil.month}/${_validUntil.year} — ${_validUntil.hour}:${_validUntil.minute.toString().padLeft(2, '0')}',
                  style: const TextStyle(color: AppColors.textPrimary),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 36),

        PrimaryButton(text: 'Generate QR Code', onPressed: _submit, isLoading: _isLoading, icon: Icons.qr_code_rounded),
      ],
    );
  }

  Widget _successView() {
    return Column(
      children: [
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.success.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 64),
        ),
        const SizedBox(height: 20),
        const Text('QR Code Generated!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        const SizedBox(height: 8),
        const Text('Share this code with your guest. The guard will verify it at the gate.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondary, height: 1.5)),
        const SizedBox(height: 32),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.accent.withOpacity(0.4)),
          ),
          child: Column(
            children: [
              const Icon(Icons.qr_code_rounded, size: 80, color: AppColors.accent),
              const SizedBox(height: 16),
              SelectableText(
                _generatedCode!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontFamily: 'monospace', letterSpacing: 1),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        PrimaryButton(
          text: 'Share via WhatsApp',
          icon: Icons.share_rounded,
          onPressed: () => showSnack(context, 'Integrate url_launcher to share via WhatsApp'),
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => setState(() => _generatedCode = null),
          child: const Text('Create Another', style: TextStyle(color: AppColors.textSecondary)),
        ),
      ],
    );
  }
}
