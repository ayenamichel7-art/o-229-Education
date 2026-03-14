import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_client.dart';
import 'package:dio/dio.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final String? error;
  final Map<String, dynamic>? user;

  AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.error,
    this.user,
  });

  AuthState copyWith({bool? isLoading, bool? isAuthenticated, String? error, Map<String, dynamic>? user}) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      error: error,
      user: user ?? this.user,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref ref;

  AuthNotifier(this.ref) : super(AuthState()) {
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    final storage = ref.read(secureStorageProvider);
    final token = await storage.read(key: 'auth_token');
    if (token != null) {
      try {
        final res = await ref.read(dioProvider).get('/auth/me');
        state = state.copyWith(isAuthenticated: true, user: res.data['data']);
      } catch (_) {
        await storage.delete(key: 'auth_token');
        state = state.copyWith(isAuthenticated: false);
      }
    }
  }

  Future<bool> login(String domain, String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final storage = ref.read(secureStorageProvider);
      
      // Save domain temporarily to be used by the interceptor for X-Tenant-Domain
      await storage.write(key: 'tenant_domain', value: domain);

      // In Laravel Sanctum, mobile apps use Token Auth. 
      // The endpoint /auth/token generates a Personal Access Token.
      final res = await ref.read(dioProvider).post('/auth/token', data: {
        'email': email,
        'password': password,
        'device_name': 'mobile_app',
      });

      final token = res.data['token'];
      if (token != null) {
        await storage.write(key: 'auth_token', value: token);
        await _checkLoginStatus();
        return true;
      }
      throw Exception('Token not found');
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false, 
        error: e.response?.data['message'] ?? 'Erreur de connexion',
      );
      return false;
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Une erreur inattendue est survenue');
      return false;
    }
  }

  Future<void> logout() async {
    final storage = ref.read(secureStorageProvider);
    await storage.delete(key: 'auth_token');
    state = state.copyWith(isAuthenticated: false, user: null);
  }
}
