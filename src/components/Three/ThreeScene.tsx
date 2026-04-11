"use client";

import { useEffect } from "react";
import * as THREE from 'three';

interface ThreeObject {
  type: string,
  color: string,
  size: number,
}

export default function ThreeScene({ container } : { container: HTMLElement }) {
  useEffect(() => {
    // 1. 获取解析器存放在 data-objects 中的数据s
    const dataStr = container.getAttribute('data-objects');
    if (!dataStr) return;
    const objects: ThreeObject[] = JSON.parse(dataStr);

    // 2. 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);

    const width = container.clientWidth || 300;
    const height = 300; // 建议固定高度或从 CSS 读取

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 3. 根据解析出的类型创建几何体
    const meshes: THREE.Mesh[] = [];
    objects.forEach((obj, index) => {
      let geometry;
      switch (obj.type) {
        case 'sphere': geometry = new THREE.SphereGeometry(obj.size); break;
        case 'torus': geometry = new THREE.TorusGeometry(obj.size, 0.3, 16, 100); break;
        case 'cylinder': geometry = new THREE.CylinderGeometry(obj.size, obj.size, 2, 32); break;
        default: geometry = new THREE.BoxGeometry(obj.size, obj.size, obj.size);
      }

      // 直接透传颜色字符串，Three.js 原生支持
      const material = new THREE.MeshStandardMaterial({ color: obj.color });
      const mesh = new THREE.Mesh(geometry, material);
      
      // 简单排成一排
      mesh.position.x = (index - (objects.length - 1) / 2) * 3;
      scene.add(mesh);
      meshes.push(mesh);
    });

    camera.position.z = 8;

    // 4. 动画循环
    let frameId: number;
    const animate = () => {
      meshes.forEach(m => {
        m.rotation.y += 0.01;
        m.rotation.x += 0.005;
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // 5. 清理函数：防止内存泄漏和重复渲染
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [container]);

  return null;
}