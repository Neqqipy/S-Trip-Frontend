import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Mock data for provinces
const mockData = {
  "Hà Nội": { population: "8.4 triệu", area: "3,359 km²", fact: "Thủ đô ngàn năm văn hiến, nổi tiếng với 36 phố phường và trà đá vỉa hè." },
  "TP. Hồ Chí Minh": { population: "9.3 triệu", area: "2,061 km²", fact: "Trung tâm kinh tế lớn nhất Việt Nam, thành phố không ngủ." },
  "Đà Nẵng": { population: "1.2 triệu", area: "1,285 km²", fact: "Thành phố đáng sống nhất Việt Nam, nổi tiếng với các cây cầu độc đáo." },
  "Hải Phòng": { population: "2.1 triệu", area: "1,562 km²", fact: "Thành phố hoa phượng đỏ, cảng biển lớn nhất miền Bắc." },
  "Cần Thơ": { population: "1.2 triệu", area: "1,439 km²", fact: "Thủ phủ miền Tây sông nước, nổi tiếng với chợ nổi Cái Răng." },
  "Quảng Ninh": { population: "1.3 triệu", area: "6,178 km²", fact: "Sở hữu Vịnh Hạ Long - Di sản thiên nhiên thế giới." },
  "Khánh Hòa": { population: "1.2 triệu", area: "5,197 km²", fact: "Nổi tiếng với thành phố biển Nha Trang, vịnh Cam Ranh tuyệt đẹp." },
  "Lâm Đồng": { population: "1.3 triệu", area: "9,783 km²", fact: "Nổi tiếng với Đà Lạt - thành phố sương mù, vương quốc hoa." },
  "Thừa Thiên Huế": { population: "1.1 triệu", area: "5,033 km²", fact: "Cố đô của Việt Nam với hệ thống lăng tẩm và nhã nhạc cung đình." },
  "Kiên Giang": { population: "1.7 triệu", area: "6,348 km²", fact: "Sở hữu đảo ngọc Phú Quốc - thiên đường du lịch biển." },
};

const PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

const PROVINCE_COLORS = {
  "Lai Chau": "#4ade80", "Điện Biên": "#fde047", "Son La": "#fb923c", "Lào Cai": "#f87171",
  "Yên Bái": "#60a5fa", "Hà Giang": "#2dd4bf", "Tuyên Quang": "#c084fc", "Cao Bằng": "#fde047",
  "Bắc Kạn": "#2dd4bf", "Lạng Sơn": "#4ade80", "Thái Nguyên": "#f87171", "Phú Thọ": "#2dd4bf",
  "Vĩnh Phúc": "#fde047", "Ha Noi": "#60a5fa", "Hòa Bình": "#c084fc", "Bắc Giang": "#fb923c",
  "Quảng Ninh": "#f87171", "Hải Dương": "#fde047", "Hung Yen": "#4ade80", "Hà Nam": "#fde047",
  "Ninh Bình": "#4ade80", "Thái Bình": "#fb923c", "Nam Định": "#f87171", "Thanh Hóa": "#2dd4bf",
  "Nghệ An": "#fb923c", "Ha Tinh": "#4ade80", "Quảng Bình": "#fde047", "Quảng Trị": "#60a5fa",
  "Huế": "#f87171", "Da Nang": "#fde047", "Quàng Nam": "#4ade80", "Quảng Ngãi": "#60a5fa",
  "Kon Tum": "#fb923c", "Gia Lai": "#fde047", "Bình Định": "#fb923c", "Phú Yên": "#4ade80",
  "Dak Lak": "#f87171", "Khánh Hòa": "#60a5fa", "Đăk Nông": "#2dd4bf", "Lâm Đồng": "#fb923c",
  "Ninh Thuận": "#4ade80", "Bình Thuận": "#60a5fa", "Bình Phước": "#4ade80", "Tây Ninh": "#fde047",
  "Bình Dương": "#60a5fa", "Southeast": "#fde047", "Bà Rịa-Vũng Tàu": "#fb923c", "Hồ Chí Minh city": "#f87171",
  "Long An": "#4ade80", "Tiền Giang": "#fde047", "Bến Tre": "#4ade80", "Trà Vinh": "#60a5fa",
  "Vĩnh Long": "#2dd4bf", "Đồng Tháp": "#fb923c", "An Giang": "#4ade80", "Kiên Giang": "#fde047",
  "Can Tho": "#f87171", "Hau Giang": "#60a5fa", "Sóc Trăng": "#fde047", "Bắc Liêu": "#4ade80",
  "Cà Mau": "#fb923c", "Haiphong": "#60a5fa"
};

const TEXT_OFFSETS = {
  "Vĩnh Phúc": [0.1, 0.1],
  "Ha Noi": [0, -0.1],
  "Bắc Ninh": [0.15, 0.1],
  "Hải Dương": [0.1, -0.1],
  "Hung Yen": [0, -0.15],
  "Ha Nam": [-0.1, -0.1],
  "Thái Bình": [0.2, 0],
  "Nam Định": [0.1, -0.2],
  "Haiphong": [0.2, 0.1],
  "Hồ Chí Minh city": [0.2, 0.1],
  "Tiền Giang": [0.1, -0.1],
  "Bến Tre": [0.15, -0.1],
  "Vĩnh Long": [-0.1, 0.1],
  "Trà Vinh": [0.2, -0.1],
  "Bắc Liêu": [-0.15, -0.1],
  "Sóc Trăng": [0.15, 0.1]
};

const DISPLAY_NAMES = {
  "Da Nang": "Đà Nẵng",
  "Huế": "Thừa Thiên Huế",
  "Quàng Nam": "Quảng Nam",
  "Haiphong": "Hải Phòng",
  "Hồ Chí Minh city": "TP. Hồ Chí Minh",
  "Can Tho": "Cần Thơ",
  "Southeast": "Đồng Nai",
  "Dak Lak": "Đắk Lắk",
  "Ha Noi": "Hà Nội",
  "Son La": "Sơn La",
  "Lai Chau": "Lai Châu",
  "Ha Tinh": "Hà Tĩnh",
  "Hung Yen": "Hưng Yên",
  "Hau Giang": "Hậu Giang"
};

function Province({ data, projection, color, isSelected, anySelected, onClick, onHover, isHero, mapCx, mapCy }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { name, geometry } = data;

  const { shapes, center } = useMemo(() => {
    const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    // Find bounding box
    polys.forEach(polygon => {
      polygon[0].forEach((coord) => {
        const [x, y] = projection(coord);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
    });
    
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    
    // Offset shapes to their own centroid
    const offsetShapes = [];
    polys.forEach(polygon => {
      const shape = new THREE.Shape();
      polygon[0].forEach((coord, i) => {
        const [x, y] = projection(coord);
        const ox = x - cx;
        const oy = y - cy;
        if (i === 0) shape.moveTo(ox, oy);
        else shape.lineTo(ox, oy);
      });
      offsetShapes.push(shape);
    });

    return { shapes: offsetShapes, center: [cx, cy] };
  }, [geometry, projection]);

  const extrudeSettings = useMemo(() => ({
    depth: isHero ? 0.05 : 0.8, // Thinner base for 2D look
    bevelEnabled: !isHero,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2
  }), [isHero]);

  useFrame(() => {
    if (groupRef.current) {
      // Pop-up effect when selected!
      const targetScale = isSelected ? 3.0 : 0.995;
      const targetZ = isSelected ? 3 : (hovered && !anySelected ? 0.8 : 0);
      
      // Fly to the middle of the right frame
      const heroOffsetX = isHero ? 3.0 : 0;
      const targetX = isSelected && mapCx !== undefined ? mapCx + heroOffsetX : center[0];
      const targetY = isSelected && mapCy !== undefined ? mapCy : center[1];
      
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.15);
      groupRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.15);
    }
  });

  // Colors based on state
  const isDimmed = anySelected && !isSelected;
  // Keep original color, just dim opacity
  const baseColor = color;
  const emissive = color;
  const emissiveIntensity = isSelected ? 0.6 : (hovered && !anySelected ? 0.4 : (isDimmed ? 0 : 0.15));
  const opacity = isDimmed ? 0.2 : (isSelected ? 1 : 0.95);

  const initialPosition = useMemo(() => [center[0], center[1], 0], [center[0], center[1]]);
  const initialScale = useMemo(() => [0.995, 0.995, 1], []);

  return (
    <group 
      ref={groupRef}
      position={initialPosition}
      scale={initialScale}
      onClick={(e) => {
        e.stopPropagation();
        if (isSelected) {
          onClick(null); // Deselect if already selected
        } else {
          onClick({ ...data, cx: center[0], cy: center[1] }); // Pass center for camera lerping
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(name);
      }}
      onPointerOut={(e) => {
        setHovered(false);
        onHover(null);
      }}
    >
      {shapes.map((shape, i) => (
        <mesh key={i}>
          <extrudeGeometry args={[shape, extrudeSettings]} />
          <meshStandardMaterial 
            color={baseColor} 
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
            roughness={isSelected ? 0.1 : 0.3}
            metalness={isSelected ? 0.6 : 0.2}
            transparent={true}
            opacity={opacity}
          />
          {isSelected && (
            <lineSegments position={[0, 0, extrudeSettings.depth + 0.01]}>
              <edgesGeometry args={[new THREE.ShapeGeometry(shape)]} />
              <lineBasicMaterial color="#ffffff" linewidth={3} />
            </lineSegments>
          )}
        </mesh>
      ))}
      
      {/* Province Name */}
      {(!anySelected || isSelected) && (
        <Text
          position={[
            (TEXT_OFFSETS[name]?.[0] || 0), 
            (TEXT_OFFSETS[name]?.[1] || 0), 
            extrudeSettings.depth + 0.1
          ]}
          fontSize={isSelected ? 0.35 : 0.14}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#ffffff"
          fontWeight="bold"
        >
          {DISPLAY_NAMES[name] || name}
        </Text>
      )}

      {/* Special Label for Phu Quoc Island (belongs to Kien Giang) */}
      {name === "Kiên Giang" && (!anySelected || isSelected) && (
        <Text
          position={[-1.3, 0.2, extrudeSettings.depth + 0.1]}
          fontSize={isSelected ? 0.2 : 0.1}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#ffffff"
          fontWeight="bold"
        >
          ĐẢO PHÚ QUỐC
        </Text>
      )}
    </group>
  );
}

function Archipelago({ name, position, isTruongSa, onSelectProvince, anySelected, isSelected, mapCx, mapCy, isHero }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  const islands = useMemo(() => {
    const dots = [];
    const count = isTruongSa ? 25 : 12; // More islands for Truong Sa
    const spreadX = isTruongSa ? 2.5 : 1.2;
    const spreadY = isTruongSa ? 3.0 : 1.2;
    
    // Deterministic pseudo-random based on name
    let seed = isTruongSa ? 1337 : 42;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for(let i = 0; i < count; i++) {
      dots.push({
        x: (random() - 0.5) * spreadX,
        y: (random() - 0.5) * spreadY,
        r: 0.04 + random() * 0.06 // tiny radius
      });
    }
    return { dots, spreadX, spreadY };
  }, [isTruongSa]);

  useFrame(() => {
    if (groupRef.current) {
      const targetScale = isSelected ? 3.0 : 1.0;
      const targetZ = isSelected ? 3.0 : (hovered && !anySelected ? 0.3 : 0);
      
      const heroOffsetX = isHero ? 3.0 : 0;
      const targetX = isSelected && mapCx !== undefined ? mapCx + heroOffsetX : position[0];
      const targetY = isSelected && mapCy !== undefined ? mapCy : position[1];
      
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.15);
      groupRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.15);
    }
  });

  const isDimmed = anySelected && !isSelected;
  const baseColor = hovered && !anySelected ? '#4facfe' : '#2563eb';
  const emissive = hovered && !anySelected ? '#00f2fe' : '#1e40af';
  const emissiveIntensity = hovered && !anySelected ? 0.6 : (isDimmed ? 0 : 0.3);
  const opacity = isDimmed ? 0.2 : 0.95;

  return (
    <group position={position} ref={groupRef}>
      {/* Scattered island dots */}
      {islands.dots.map((dot, i) => (
        <mesh key={i} position={[dot.x, dot.y, 0]}>
          <cylinderGeometry args={[dot.r, dot.r, 0.1, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial 
            color={baseColor} 
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
            roughness={0.2}
            metalness={0.3}
            transparent={true}
            opacity={opacity}
          />
        </mesh>
      ))}

      {/* Invisible hitbox for easy hovering and clicking */}
      <mesh 
        position={[0, 0, -1]}
        onPointerOver={(e) => { e.stopPropagation(); if (!anySelected) setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (anySelected) {
            onSelectProvince(null);
          } else {
            onSelectProvince({
              name: name,
              population: "N/A",
              area: "N/A",
              fact: `Quần đảo thuộc chủ quyền thiêng liêng của Việt Nam.`
            });
          }
        }}
      >
        <planeGeometry args={[islands.spreadX + 1.5, islands.spreadY + 1.5]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      
      {/* Label */}
      <Text
        position={[0, - (islands.spreadY / 2 + 0.6), 0.1]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#0f172a"
        fontWeight="bold"
        visible={!isDimmed}
      >
        {name}
      </Text>
    </group>
  );
}

function MapModel({ geojson, onSelectProvince, selectedProvince, isHero, position = [0, 0, 0], scale = [1, 1, 1] }) {
  const groupRef = useRef();
  
  const projection = useMemo(() => {
    return (coord) => {
      return [
        (coord[0] - 1500) / 400,
        (coord[1] - 4500) / 400
      ];
    };
  }, []);

  const { mapCx, mapCy } = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    geojson.features.forEach(feature => {
      const polys = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      polys.forEach(poly => {
        poly[0].forEach(coord => {
          const [x, y] = projection(coord);
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        });
      });
    });
    return { mapCx: (minX + maxX) / 2, mapCy: (minY + maxY) / 2 };
  }, [geojson, projection]);

  const [hoveredName, setHoveredName] = useState(null);

  useFrame(() => {
    if (groupRef.current) {
      const targetX = -mapCx + position[0];
      const targetY = -mapCy + position[1];
      const targetZ = position[2];
      
      groupRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1);
    }
  });

  const anySelected = !!selectedProvince;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {geojson.features.map((feature, idx) => {
        const name = feature.properties.name || feature.properties.ten_tinh || feature.properties["name:en"] || `Province ${idx}`;
        const info = mockData[name] || {
          population: "N/A",
          area: "N/A",
          fact: "Một vùng đất tươi đẹp của Việt Nam."
        };
        const data = { 
          ...feature, 
          name, 
          displayName: DISPLAY_NAMES[name] || name,
          ...info 
        };
        
        return (
          <Province 
            key={idx}
            data={data}
            projection={projection}
            color={PROVINCE_COLORS[name] || PALETTE[idx % PALETTE.length]}
            isSelected={selectedProvince?.name === name}
            anySelected={anySelected}
            onClick={(d) => {
              if (anySelected) {
                onSelectProvince(null);
              } else {
                onSelectProvince(d);
              }
            }}
            onHover={setHoveredName}
            isHero={isHero}
            mapCx={mapCx}
            mapCy={mapCy}
          />
        );
      })}

      {/* Islands */}
      <Archipelago 
        name="QUẦN ĐẢO HOÀNG SA" 
        position={[9.5, -1.5, 0.1]} 
        onSelectProvince={onSelectProvince}
        anySelected={anySelected}
        isSelected={selectedProvince?.name === "QUẦN ĐẢO HOÀNG SA"}
        mapCx={mapCx}
        mapCy={mapCy}
        isHero={isHero}
      />
      <Archipelago 
        name="QUẦN ĐẢO TRƯỜNG SA" 
        position={[12.5, -12.5, 0.1]} 
        isTruongSa={true} 
        onSelectProvince={onSelectProvince}
        anySelected={anySelected}
        isSelected={selectedProvince?.name === "QUẦN ĐẢO TRƯỜNG SA"}
        mapCx={mapCx}
        mapCy={mapCy}
        isHero={isHero}
      />
    </group>
  );
}

export default function Map3D({ onSelectProvince, selectedProvince, isHero, position = [0, 0, 0], scale = [1, 1, 1] }) {
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    fetch('/vietnam.json')
      .then(res => res.json())
      .then(data => {
        setGeojson(data);
      })
      .catch(err => console.error("Error loading GeoJSON", err));
  }, []);

  if (!geojson) return null;

  return <MapModel geojson={geojson} onSelectProvince={onSelectProvince} selectedProvince={selectedProvince} isHero={isHero} position={position} scale={scale} />;
}
