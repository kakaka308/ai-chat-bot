"use client";

import { useEffect, useRef } from "react";
import * as THREE from 'three';

interface ThreeObject {
  type: string,
  color: string,
  size: number,
}

export default function ThreeScene({ container } : { container: HTMLElement }) {
  const isRenderedRef = useRef(false);
  
  useEffect(() => {
    // 防止重复渲染
    if (isRenderedRef.current) return;
    
    console.log('ThreeScene: 开始渲染', container);
    
    // 1. 获取解析器存放在 data-objects 中的数据
    const dataStr = container.getAttribute('data-objects');
    console.log('data-objects 原始值:', dataStr);
    
    // 如果没有数据，静默返回（不报错）
    if (!dataStr || dataStr === '[]' || dataStr === 'null') {
      console.log('ThreeScene: 没有有效的 data-objects 数据，等待后续更新');
      return;
    }
    
    let objects: ThreeObject[];
    try {
      objects = JSON.parse(dataStr);
      console.log('解析后的 objects:', objects);
    } catch (error) {
      console.error('JSON 解析失败:', error);
      return;
    }
    
    // 如果 objects 为空数组，静默返回
    if (!objects || objects.length === 0) {
      console.log('ThreeScene: objects 为空数组，等待有效数据');
      return;
    }
    
    // 标记已渲染，防止重复
    isRenderedRef.current = true;

    // 2. 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);

    const width = container.clientWidth || 300;
    const height = 300;
    console.log('画布尺寸:', width, height);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    console.log('WebGL渲染器已添加');

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 3. 根据解析出的类型创建几何体
    const meshes: THREE.Mesh[] = [];
    objects.forEach((obj, index) => {
      console.log(`创建物体 ${index}:`, obj);
      let geometry;
      switch (obj.type) {
        case 'sphere': geometry = new THREE.SphereGeometry(obj.size); break;
        case 'torus': geometry = new THREE.TorusGeometry(obj.size, 0.3, 16, 100); break;
        case 'cylinder': geometry = new THREE.CylinderGeometry(obj.size, obj.size, 2, 32); break;
        default: geometry = new THREE.BoxGeometry(obj.size, obj.size, obj.size);
      }

      const material = new THREE.MeshStandardMaterial({ color: obj.color });
      const mesh = new THREE.Mesh(geometry, material);
      
      // 根据物体数量自动调整位置
      const offset = (index - (objects.length - 1) / 2) * 3;
      mesh.position.x = offset;
      scene.add(mesh);
      meshes.push(mesh);
    });

    // 调整相机位置以适应多个物体
    camera.position.z = Math.max(8, objects.length * 2);
    camera.lookAt(0, 0, 0);

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
    console.log('动画已启动');

    // 5. 清理函数
    return () => {
      console.log('ThreeScene: 清理');
      cancelAnimationFrame(frameId);
      meshes.forEach(mesh => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, [container]);

  return null;
}