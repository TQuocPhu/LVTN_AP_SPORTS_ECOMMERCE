import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { STORE_LOCATION_CONSTANTS } from '../../constants/location-constants';

interface DeliveryTrackingMapProps {
  orderStatus: string;
  trackingCode?: string;
  destLat?: number | null;
  destLng?: number | null;
  destAddress?: string;
  height?: number;
}

export const DeliveryTrackingMap: React.FC<DeliveryTrackingMapProps> = ({
  orderStatus,
  trackingCode,
  destLat,
  destLng,
  destAddress,
  height = 320,
}) => {
  // Điểm xuất phát chuẩn xác từ frontend: Kho hàng AP Sports Central (Đại học Cần Thơ)
  const originLat = STORE_LOCATION_CONSTANTS.STORE_GPS_LATITUDE; // 10.0299337
  const originLng = STORE_LOCATION_CONSTANTS.STORE_GPS_LONGITUDE; // 105.7684266
  const originName = STORE_LOCATION_CONSTANTS.STORE_NAME;
  const originAddress = STORE_LOCATION_CONSTANTS.STORE_ADDRESS;

  // Điểm đích đến: Tọa độ GPS khách hàng (hoặc mặc định trung tâm giao hàng)
  const targetLat = destLat || 10.0345;
  const targetLng = destLng || 105.7865;
  const targetAddressText = destAddress || 'Địa chỉ khách hàng đã đăng ký';

  // Trạng thái vận chuyển
  const isShipping = orderStatus === 'shipping';
  const isDelivered = orderStatus === 'delivered' || orderStatus === 'completed';

  const htmlContent = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          
          /* Marker Kho Cần Thơ */
          .marker-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #ffffff;
            padding: 4px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
          }
          .marker-badge-origin {
            border: 2px solid #ea580c;
            color: #ea580c;
          }
          .marker-badge-dest {
            border: 2px solid #10b981;
            color: #10b981;
          }
          
          /* Marker Xe Tải GHN Di Chuyển */
          .truck-animated-marker {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .truck-circle {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #0284c7;
            border: 2px solid white;
            box-shadow: 0 4px 14px rgba(2, 132, 199, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            z-index: 10;
          }
          .pulse-ring {
            position: absolute;
            width: 46px;
            height: 46px;
            border-radius: 50%;
            background: rgba(2, 132, 199, 0.35);
            animation: pulse-truck 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          }
          @keyframes pulse-truck {
            0% { transform: scale(0.8); opacity: 0.9; }
            70% { transform: scale(1.4); opacity: 0; }
            100% { transform: scale(1.4); opacity: 0; }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const origin = [${originLat}, ${originLng}];
          const dest = [${targetLat}, ${targetLng}];

          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          });

          // Bản đồ đường phố OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          // Tạo Icons
          const originIcon = L.divIcon({
            className: '',
            html: '<div class="marker-badge marker-badge-origin">🏪 Kho AP Sports (Cần Thơ)</div>',
            iconSize: [160, 32],
            iconAnchor: [80, 16]
          });

          const destIcon = L.divIcon({
            className: '',
            html: '<div class="marker-badge marker-badge-dest">📍 Điểm Giao Hàng</div>',
            iconSize: [130, 32],
            iconAnchor: [65, 16]
          });

          const truckIcon = L.divIcon({
            className: 'truck-animated-marker',
            html: '<div class="pulse-ring"></div><div class="truck-circle">🚚</div>',
            iconSize: [46, 46],
            iconAnchor: [23, 23]
          });

          // Đặt Marker Kho Cần Thơ & Điểm Đến
          L.marker(origin, { icon: originIcon }).addTo(map)
            .bindPopup('<b>${originName}</b><br/><span style="font-size:11px;color:#64748b;">${originAddress}</span>');
          L.marker(dest, { icon: destIcon }).addTo(map)
            .bindPopup('<b>Địa chỉ nhận hàng</b><br/><span style="font-size:11px;color:#64748b;">${targetAddressText}</span>');

          // Marker Xe Tải Khởi Tạo
          const truckMarker = L.marker(origin, { icon: truckIcon, zIndexOffset: 1000 }).addTo(map)
            .bindPopup('<b>Xe Tải Shipper GHN</b><br/>Vận đơn: <code>${trackingCode || 'GHN-LOGISTICS'}</code>');

          // Gọi API dẫn đường OSRM thật nối giữa Cần Thơ và Khách Hàng
          const osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + origin[1] + ',' + origin[0] + ';' + dest[1] + ',' + dest[0] + '?overview=full&geometries=geojson';

          fetch(osrmUrl)
            .then(res => res.json())
            .then(data => {
              let roadCoords = [origin, dest];
              if (data && data.code === 'Ok' && data.routes && data.routes.length > 0) {
                roadCoords = data.routes[0].geometry.coordinates.map(pt => [pt[1], pt[0]]);
              }

              // Vẽ tuyến đường màu cam AP Sports
              const routeLine = L.polyline(roadCoords, {
                color: '#ea580c',
                weight: 5,
                opacity: 0.9,
                dashArray: '8, 8'
              }).addTo(map);

              map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

              ${
                isShipping
                  ? `
                // Mô phỏng xe di chuyển liên tục dọc theo tuyến đường từ Cần Thơ
                let step = 0;
                setInterval(() => {
                  step = (step + 1) % roadCoords.length;
                  truckMarker.setLatLng(roadCoords[step]);
                }, 100);
              `
                  : isDelivered
                  ? `
                // Đã giao hàng: xe đỗ tại điểm nhận hàng
                truckMarker.setLatLng(dest);
              `
                  : `
                // Đang chuẩn bị hàng tại kho Cần Thơ
                truckMarker.setLatLng(origin);
              `
              }
            })
            .catch(() => {
              // Fallback đường thẳng nếu mất mạng OSRM
              const fallbackLine = L.polyline([origin, dest], { color: '#ea580c', weight: 4 }).addTo(map);
              map.fitBounds(fallbackLine.getBounds(), { padding: [40, 40] });
            });
        </script>
      </body>
      </html>
    `;
  }, [originLat, originLng, originName, originAddress, targetLat, targetLng, targetAddressText, trackingCode, isShipping, isDelivered]);

  return (
    <View style={styles.card}>
      {/* Header trạng thái xe vận chuyển */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.badgePulse}>
            <Ionicons name="navigate" size={16} color="#0284c7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Lộ Trình Xe Giao Hàng GHN Trực Quan</Text>
            <Text style={styles.subtitle}>
              {isShipping
                ? 'Xe tải GHN đang vận chuyển kiện hàng từ Kho Cần Thơ tới bạn'
                : isDelivered
                ? 'Kiện hàng đã giao tới tận tay bạn an toàn'
                : 'Đang đóng gói và kiểm đếm tại Kho AP Sports Cần Thơ'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bản đồ xe chạy */}
      <View style={[styles.mapWrapper, { height }]}>
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.webview}
          scrollEnabled={false}
          renderLoading={() => (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}
          startInLoadingState
        />
      </View>

      {/* Footer chi tiết xuất phát Cần Thơ */}
      <View style={styles.footer}>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Kho Xuất Hàng (Cần Thơ):</Text>
          <Text style={styles.infoVal} numberOfLines={1}>
            Đại học Cần Thơ, Q. Ninh Kiều
          </Text>
        </View>
        <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.infoLabel}>Mã vận đơn GHN:</Text>
          <Text style={styles.trackingCode}>{trackingCode || 'GHN-LOGISTICS'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.slate200,
    overflow: 'hidden',
    marginVertical: Spacing.xs,
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate100,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badgePulse: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.slate500,
    marginTop: 2,
    lineHeight: 16,
  },
  mapWrapper: {
    width: '100%',
    backgroundColor: Colors.slate100,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingBox: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.slate100,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.slate50,
    borderTopWidth: 1,
    borderTopColor: Colors.slate200,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.slate500,
    marginBottom: 2,
  },
  infoVal: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.slate800,
  },
  trackingCode: {
    fontSize: 11,
    fontWeight: Typography.weights.black,
    color: Colors.secondary,
  },
});
