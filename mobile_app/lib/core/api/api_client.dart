import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

final dioProvider = Provider<Dio>((ref) {
  final secureStorage = ref.watch(secureStorageProvider);
  
  final dio = Dio(BaseOptions(
    // Remplacez par l'IP de votre machine pour Android Emulator (10.0.2.2) ou l'URL de votre serveur
    baseUrl: 'http://localhost/api/v1',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  ));

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await secureStorage.read(key: 'auth_token');
        /// On the real multi-tenant cloud, we append X-Tenant-Domain:
        final tenant = await secureStorage.read(key: 'tenant_domain');
        
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        if (tenant != null) {
          // This allows OMI architecture to identify Tenant from headers
          options.headers['X-Tenant-Domain'] = tenant;
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        if (e.response?.statusCode == 401) {
          // Handle token expiration/logout here
        }
        return handler.next(e);
      },
    ),
  );

  return dio;
});
