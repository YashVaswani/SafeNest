import 'package:flutter/material.dart';
import 'login_page.dart';

void main() {
  runApp(const SafeNestApp());
}

class SafeNestApp extends StatelessWidget {
  const SafeNestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SafeNest',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blueAccent,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        fontFamily: 'Inter', // Note: You might want to add this font to pubspec.yaml
      ),
      home: const LoginPage(),
    );
  }
}
