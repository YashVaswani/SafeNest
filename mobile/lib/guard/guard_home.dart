import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../core/widgets.dart';
import '../auth/phone_screen.dart';
import 'guard_result_screen.dart';
import 'guard_log.dart';

class GuardHomeScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  const GuardHomeScreen({super.key, required this.user});

  @override
  State<GuardHomeScreen> createState() => _GuardHomeScreenState();
}

class _GuardHomeScreenState extends State<GuardHomeScreen> {
  final _searchController = TextEditingController();
  int _currentIndex = 1;
  bool _isSearching = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    setState(() => _isSearching = true);
    final result = await ApiService.getHelpers(search: query);
    
    if (!mounted) return;
    setState(() => _isSearching = false);

    if (result['success'] == true) {
      final helpers = (result['helpers'] as List?) ?? [];
      if (helpers.isNotEmpty) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => GuardResultScreen(visitor: helpers.first as Map<String, dynamic>, user: widget.user),
          ),
        );
      } else {
        showSnack(context, 'No results found', isError: true);
      }
    } else {
      showSnack(context, result['message'] ?? 'Search failed', isError: true);
    }
  }

  Future<void> _triggerSOS() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Send SOS Alert?', style: TextStyle(color: AppColors.textPrimary)),
        content: const Text('This will immediately alert the admin and all guards. Are you sure?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('Send SOS'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final result = await ApiService.fileAlert(description: 'SOS triggered by guard at main gate', severity: 'SOS');
    if (!mounted) return;
    showSnack(context, result['success'] == true ? '🚨 SOS Alert sent' : 'Failed', isError: result['success'] != true);
  }

  void _handleManualQr() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Simulate Scan'),
        content: const Text('Would you like to simulate a successful guest QR scan?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.push(context, MaterialPageRoute(builder: (_) => GuardResultScreen(visitor: {
                'fullName': 'Pre-Approved Guest',
                'phoneNumber': '+918888888888',
                'role': 'GUEST',
                'flatNumber': 'A-101',
                'qrVerified': true,
              }, user: widget.user)));
            },
            child: const Text('Simulate Verify'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_currentIndex == 1) return _buildScannerScreen();
    if (_currentIndex == 2) return Scaffold(appBar: AppBar(title: const Text('Settings')), body: Center(child: TextButton(onPressed: () => ApiService.logout().then((_) => Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const PhoneScreen()), (r) => false)), child: const Text('Logout', style: TextStyle(color: AppColors.danger)))));
    return GuardLogScreen(user: widget.user);
  }

  Widget _buildScannerScreen() {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              color: AppColors.surface,
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Main Gate - Whitefield Society',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                        ),
                      ),
                      const CircleAvatar(
                        radius: 16,
                        backgroundImage: NetworkImage('https://randomuser.me/api/portraits/men/44.jpg'),
                      )
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        width: 8, height: 8,
                        decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 8),
                      const Text('System Online', style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Search Bar
                  TextField(
                    controller: _searchController,
                    onSubmitted: (_) => _search(),
                    decoration: InputDecoration(
                      hintText: 'Search by Phone Number / Partner ID',
                      prefixIcon: const Icon(Icons.search_rounded),
                      filled: true,
                      fillColor: AppColors.background,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                    ),
                  ),
                  if (_isSearching) const LinearProgressIndicator(),
                ],
              ),
            ),
            
            // Scanner Viewfinder Area
            Expanded(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Placeholder for actual camera feed
                  Container(color: Colors.black87),
                  
                  // Viewfinder Box
                  GestureDetector(
                    onTap: _handleManualQr,
                    child: Container(
                      width: 250,
                      height: 250,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.white.withValues(alpha: 0.5), width: 2),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Stack(
                        children: [
                          Align(alignment: Alignment.center, child: Icon(Icons.qr_code_scanner_rounded, size: 100, color: Colors.white.withValues(alpha: 0.8))),
                        ],
                      ),
                    ),
                  ),
                  
                  Positioned(
                    bottom: 40,
                    child: const Text(
                      'Scan QR Code or Tap RFID Tag\n(Tap square to simulate scan)',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                  )
                ],
              ),
            ),

            // SOS Button
            Container(
              width: double.infinity,
              color: Colors.black87,
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: ElevatedButton(
                onPressed: _triggerSOS,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.danger,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('SOS / Alert', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.history_rounded), label: 'History'),
          BottomNavigationBarItem(icon: Icon(Icons.people_alt_rounded), label: 'In-Society'),
          BottomNavigationBarItem(icon: Icon(Icons.settings_rounded), label: 'Setting'),
        ],
      ),
    );
  }
}
