import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_client.dart';

final dashboardKpiProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final dio = ref.read(dioProvider);
  final response = await dio.get('/dashboard/kpis');
  return response.data;
});
