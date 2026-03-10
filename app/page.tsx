'use client';

import { useEffect, useState } from "react";

interface ClothesData {
  top: string[]
  pants: string[]
  topCount: number
  pantsCount: number
}

type ClothesType = 'top' | 'pants'

interface MatchViewProps {
  selectedTop: string
  selectedPants: string
  getMatchImagePath: () => string | null
  checkMatchImageExists: (path: string) => Promise<boolean>
  onUploadMatch: () => void
  forceRefresh: () => void
}

function MatchView({ selectedTop, selectedPants, getMatchImagePath, checkMatchImageExists, onUploadMatch, forceRefresh }: MatchViewProps) {
  const [matchImageExists, setMatchImageExists] = useState(false);
  const matchImagePath = getMatchImagePath();

  const checkMatch = async () => {
    if (matchImagePath) {
      const exists = await checkMatchImageExists(matchImagePath);
      setMatchImageExists(exists);
    } else {
      setMatchImageExists(false);
    }
  };

  useEffect(() => {
    checkMatch();
  }, [matchImagePath]);

  if (!selectedTop || !selectedPants) {
    return <div className="text-center text-gray-400 py-10">请选择上装和下装</div>;
  }

  if (matchImageExists && matchImagePath) {
    return (
      <div className="flex flex-col items-center gap-4">
        <img src={matchImagePath} className="max-w-2xl w-full rounded-lg" alt="搭配效果" />
        <button
          onClick={onUploadMatch}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          更新搭配
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col justify-center">
        <div className="w-50 h-75 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          {selectedTop ? <img src={selectedTop} className="w-full h-full object-cover" /> : <div className="text-center leading-75 text-gray-400">选中上衣</div>}
        </div>
        <div className="w-50 h-75 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          {selectedPants ? <img src={selectedPants} className="w-full h-full object-cover" /> : <div className="text-center leading-75 text-gray-400">选中下装</div>}
        </div>
      </div>
      <button
        onClick={onUploadMatch}
        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
      >
        更新搭配
      </button>
    </div>
  );
}

export default function Home() {
  // 衣服列表 + 搭配选中
  const [clothes, setClothes] = useState<ClothesData>({ top: [], pants: [], topCount: 0, pantsCount: 0 });
  const [selectedTop, setSelectedTop] = useState('');
  const [selectedPants, setSelectedPants] = useState('');
  const [matchRefreshKey, setMatchRefreshKey] = useState(0);

  // 加载所有已上传的图片
  const loadClothes = async () => {
    const res = await fetch('/api/list');
    const data = await res.json() as ClothesData
    setClothes(data);
  }

  // 强制刷新搭配图片
  const forceRefreshMatch = () => {
    setMatchRefreshKey(prev => prev + 1);
  }

  // 更新上装选择
  const handleSelectTop = (item: string) => {
    setSelectedTop(item);
  }

  // 更新下装选择
  const handleSelectPants = (item: string) => {
    setSelectedPants(item);
  }

  // 获取搭配图片路径
  const getMatchImagePath = (): string | null => {
    if (!selectedTop || !selectedPants) return null;
    const topName = selectedTop.split('/').pop()?.split('.')[0] || '';
    const pantsName = selectedPants.split('/').pop()?.split('.')[0] || '';
    return `/assets/match/${topName}+${pantsName}.jpg`;
  }

  // 检查搭配图片是否存在
  const checkMatchImageExists = async (path: string): Promise<boolean> => {
    try {
      const res = await fetch(path, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // 上传
  const upload = async (type: ClothesType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        // 获取当前数量并传递给后端
        const currentCount = type === 'top' ? clothes.top.length : clothes.pants.length;
        formData.append('currentCount', currentCount.toString());

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const result = await res.json();

        if (result.success) {
          alert('上传成功！');
          loadClothes(); // 刷新列表
        } else {
          alert('上传失败：' + result.error);
        }
      } catch (error) {
        alert('上传失败，请重试');
      }
    };
    input.click();
  };

  // 上传搭配图片
  const uploadMatch = async () => {
    if (!selectedTop || !selectedPants) return;

    const topName = selectedTop.split('/').pop()?.split('.')[0] || '';
    const pantsName = selectedPants.split('/').pop()?.split('.')[0] || '';
    const matchFileName = `${topName}+${pantsName}`;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'match');
        formData.append('fileName', matchFileName);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const result = await res.json();
        if (result.success) {
          alert('搭配图片更新成功！');
          forceRefreshMatch();
        } else {
          alert('上传失败：' + result.error);
        }
      } catch (error) {
        alert('上传失败，请重试');
      }
    };
    input.click();
  };

  // 初始化加载
  useEffect(() => {
    loadClothes();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-5">
      <h1 className="text-center text-3xl font-bold">👔 珏师の衣橱</h1>

      {/* 上传按钮 */}
      <div className="text-center my-8">
        <button
          onClick={() => upload('top')}
          className="px-5 py-2.5 mx-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
        >
          上传上衣
        </button>
        <button
          onClick={() => upload('pants')}
          className="px-5 py-2.5 mx-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
        >
          上传下装
        </button>
      </div>

      {/* 衣物展示 */}
      <div className="flex items-center my-5">
        <h2 className="text-xl font-semibold">上装</h2>
        <span className="ml-2 text-sm text-gray-500">({clothes.top.length})</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {clothes.top.map((item) => (
          <div key={item} className="shrink-0 w-40">
            <img
              src={item}
              onClick={() => handleSelectTop(item)}
              className="w-full h-50 object-cover rounded-lg cursor-pointer border-3"
              style={{ border: selectedTop === item ? '3px solid #10b981' : '3px solid transparent' }}
            />
            <p className="text-center text-sm text-gray-600 mt-2">{item.split('/').pop()?.split('.')[0]}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center my-5">
        <h2 className="text-xl font-semibold">下装</h2>
        <span className="ml-2 text-sm text-gray-500">({clothes.pants.length})</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {clothes.pants.map((item) => (
          <div key={item} className="shrink-0 w-40">
            <img
              src={item}
              onClick={() => handleSelectPants(item)}
              className="w-full h-50 object-cover rounded-lg cursor-pointer border-3"
              style={{ border: selectedPants === item ? '3px solid #10b981' : '3px solid transparent' }}
            />
            <p className="text-center text-sm text-gray-600 mt-2">{item.split('/').pop()?.split('.')[0]}</p>
          </div>
        ))}
      </div>

      {/* 搭配预览 */}
      {selectedTop && selectedPants ? (
        <>
          <h2 className="my-10 mb-5 text-xl font-semibold">搭配效果</h2>
          <MatchView
            key={matchRefreshKey}
            selectedTop={selectedTop}
            selectedPants={selectedPants}
            getMatchImagePath={getMatchImagePath}
            checkMatchImageExists={checkMatchImageExists}
            onUploadMatch={uploadMatch}
            forceRefresh={forceRefreshMatch}
          />
        </>
      ) : (
        <div className="text-center text-gray-400 py-10">请选择上装和下装</div>
      )}
    </div>
  );
}