"use client";
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ThreeScene from './ThreeScene';

export function ThreePreviewWrapper() {
  const initializedRef = useRef(false);
  const renderedContainers = useRef(new Set<HTMLElement>());
  useEffect(() => {
    if (initializedRef.current) return;
    console.log('ThreePreviewWrapper: 初始化');
    // 把 DOM 节点变成 Three.js 渲染区域
    const processContainer = (container: HTMLElement) => {
      if (renderedContainers.current.has(container)) {
        console.log('容器已渲染过，跳过:', container);
        return;
      }
      console.log('处理容器:', container);
      console.log('data-objects:', container.getAttribute('data-objects')); 
      // 是否有有效数据
      const dataStr = container.getAttribute('data-objects');
      if (!dataStr || dataStr === '[]' || dataStr === 'null') {
        console.log('容器没有有效数据，等待后续更新');
        return;
      }
      try {
        const objects = JSON.parse(dataStr);
        if (!objects || objects.length === 0) {
          console.log('容器 objects 为空，等待后续更新');
          return;
        }
      } catch (e) {
        console.log(e,'JSON 解析失败，等待后续更新');
        return;
      }   
      container.setAttribute('data-rendered', 'true');
      renderedContainers.current.add(container);
      
      const root = createRoot(container);
      root.render(<ThreeScene container={container} />);
      console.log('ThreeScene 已渲染到容器');
    };
    
    // 监听动态添加的占位符
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // 检查节点本身
            if ((node as Element).classList?.contains('three-preview')) {
              processContainer(node as HTMLElement);
            }
            // 检查子节点
            const containers = (node as Element).querySelectorAll?.('.three-preview:not([data-rendered])') || [];
            containers.forEach(container => {
              if (container instanceof HTMLElement) {
                processContainer(container);
              }
            });
          }
        });
        
        // 也监听属性变化（当 data-objects 被更新时）
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-objects') {
          const target = mutation.target as HTMLElement;
          if (target.classList?.contains('three-preview') && !target.hasAttribute('data-rendered')) {
            processContainer(target);
          }
        }
      });
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['data-objects'] // 只监听 data-objects 属性变化
    });
    
    // 同时处理已存在的
    const existingContainers = document.querySelectorAll('.three-preview:not([data-rendered])');
    console.log('已存在的容器数量:', existingContainers.length);
    existingContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        processContainer(container);
      }
    });
    
    initializedRef.current = true;
    return () => observer.disconnect();
  }, []);
  
  return null;
}