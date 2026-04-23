import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import 'helper_profile.dart';

class HelpersListScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  const HelpersListScreen({super.key, required this.user});

  @override
  State<HelpersListScreen> createState() => _HelpersListScreenState();
}

class _HelpersListScreenState extends State<HelpersListScreen> {
  List<dynamic> _allHelpers = [];
  List<dynamic> _filteredHelpers = [];
  bool _isLoading = true;
  final _searchController = TextEditingController();
  
  String _selectedCategory = 'All';
  final List<String> _categories = ['All', 'Cook', 'Maid', 'Driver', 'Nanny'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final result = await ApiService.getHelpers();
    
    if (!mounted) return;
    
    if (result['success'] == true) {
      setState(() {
        _allHelpers = result['helpers'] as List? ?? [];
        _applyFilters();
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }

  void _applyFilters() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredHelpers = _allHelpers.where((h) {
        final matchesSearch = (h['fullName']?.toLowerCase().contains(query) == true) ||
                              (h['type']?.toLowerCase().contains(query) == true);
        final matchesCategory = _selectedCategory == 'All' || h['type'] == _selectedCategory;
        return matchesSearch && matchesCategory;
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Discover Services'),
        elevation: 0,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search & Filters Header
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.only(bottom: 12),
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search for cook, maid, nanny...',
                      prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted),
                      filled: true,
                      fillColor: AppColors.background,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                _applyFilters();
                              },
                            )
                          : null,
                    ),
                    onChanged: (_) => _applyFilters(),
                  ),
                ),
                
                // Categories
                SizedBox(
                  height: 40,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      final isSelected = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: ChoiceChip(
                          label: Text(cat),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() => _selectedCategory = cat);
                              _applyFilters();
                            }
                          },
                          selectedColor: AppColors.primary,
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : AppColors.textSecondary,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          ),
                          backgroundColor: AppColors.background,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          side: BorderSide.none,
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // List of Helpers
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredHelpers.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off_rounded, size: 64, color: AppColors.textMuted.withValues(alpha: 0.5)),
                            const SizedBox(height: 16),
                            const Text('No services found matching your criteria', style: TextStyle(color: AppColors.textSecondary)),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _filteredHelpers.length,
                        itemBuilder: (context, index) {
                          final h = _filteredHelpers[index] as Map<String, dynamic>;
                          return _MarketplaceCard(
                            helper: h,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => HelperProfileScreen(helperId: h['id'].toString())),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class _MarketplaceCard extends StatelessWidget {
  final Map<String, dynamic> helper;
  final VoidCallback onTap;

  const _MarketplaceCard({required this.helper, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final specialties = (helper['specialties'] as List<dynamic>?)?.cast<String>() ?? [];
    final rating = helper['rating']?.toString() ?? 'New';
    final type = helper['type'] ?? 'Support Staff';
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Section (Profile & Basic Info)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppColors.background,
                    backgroundImage: helper['profilePhotoUrl'] != null 
                        ? NetworkImage(helper['profilePhotoUrl']) 
                        : null,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                helper['fullName'] ?? 'Unknown',
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                                maxLines: 1, overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.warning.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.star_rounded, size: 14, color: AppColors.warning),
                                  const SizedBox(width: 4),
                                  Text(rating, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(type, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13)),
                            const SizedBox(width: 8),
                            const Text('•', style: TextStyle(color: AppColors.textMuted)),
                            const SizedBox(width: 8),
                            Text(helper['hourlyRate'] ?? 'Rates vary', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        // Specialties wrap
                        if (specialties.isNotEmpty)
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: specialties.map((s) => Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.background,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(s, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                            )).toList(),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            const Divider(height: 1, color: AppColors.border),
            
            // Bottom Section (Trust Stats)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.verified_user_rounded, size: 16, color: AppColors.success),
                      const SizedBox(width: 6),
                      Text(
                        'Trusted in ${helper['societies'] ?? 1} societies',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const Text('View Profile', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
