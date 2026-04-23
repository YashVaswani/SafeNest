import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/api_service.dart';
import 'core/theme.dart';
import 'auth/phone_screen.dart';
import 'shell/role_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));
  runApp(const SafeNestApp());
}

class SafeNestApp extends StatelessWidget {
  const SafeNestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SafeNest',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const _SplashRouter(),
    );
  }
}

/// Checks for a stored session token and routes accordingly
class _SplashRouter extends StatefulWidget {
  const _SplashRouter();

  @override
  State<_SplashRouter> createState() => _SplashRouterState();
}

class _SplashRouterState extends State<_SplashRouter> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _scaleAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOutBack);
    _animController.forward();
    _checkSession();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _checkSession() async {
    // Small delay to show splash
    await Future.delayed(const Duration(milliseconds: 1400));
    if (!mounted) return;

    final token = await ApiService.getToken();
    final user = await ApiService.getUser();

    if (!mounted) return;

    if (token != null && user != null) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => RoleShell(role: user['role'] as String? ?? 'RESIDENT', user: user)),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const PhoneScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Center(
        child: ScaleTransition(
          scale: _scaleAnim,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primary.withOpacity(0.3), AppColors.accent.withOpacity(0.15)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.shield_rounded, size: 72, color: AppColors.primary),
              ),
              const SizedBox(height: 24),
              const Text(
                'SafeNest',
                style: TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -1.5),
              ),
              const SizedBox(height: 6),
              const Text(
                'Smart Society Security',
                style: TextStyle(fontSize: 14, color: AppColors.textSecondary, letterSpacing: 1),
              ),
              const SizedBox(height: 56),
              const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2.5),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
