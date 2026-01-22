import React, { useState, useRef } from 'react';

const onDragStart = (event, nodeType, isPreset = false, data = null) => {
  if (isPreset) {
    event.dataTransfer.setData(
      'application/reactflow-preset',
      JSON.stringify(data)
    );
  }
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

const SectionHeader = ({title, isOpen, toggle }) => (
  <div
    onClick={toggle}
    className="flex justify-between items-center p-3 bg-gray-200 cursor-pointer border-b border-gray-300 font-bold text-sm select-none hover:bg-gray-300 transition-colors"
  >
    <span>{title}</span>
    <span>{isOpen ? '▼' : '▶'}</span>
  </div>
);

const SectionBody = ({open, item, textStyle}) => (
<div>
  {open && (
    <div className="bg-gray-50 py-2 min-h-[100px]">
      {item.length === 0 ? (
        <div style={{color:'gray', fontSize:'10px'}}>
          キャンバス上のノードを右クリックで保存できます
        </div>
      ) : (
        item.map((p) => (
          <div
            key={p.id}
            className={textStyle}
            style={{
              borderLeft: `10px solid ${p.color}`,
              textAlign: 'left',
              paddingLeft: '12px',
            }}
            onDragStart={(e) => onDragStart(e, 'custom', true, p)}
            draggable
          >
            <span className="font-semibold">{p.label}</span>
          </div>
        ))
      )}
    </div>
  )}
</div>
);

const Sidebar = ({ presets, onSave, onRestore, onExport, onImport }) => {
  const [basicOpen, setBasicOpen] = useState(true);
  const [presetsOpen, setPresetsOpen] = useState(true);
  const fileInputRef = useRef(null); // ファイル選択用の参照
  const defaultPressets = 
  [{
    id: `default-1`,
    label: '開始ノード',
    color: '#3b82f6',
    handlePattern: 'bottom',
  },{
    id: 'default-2',
    label: '処理ノード',
    color: '#10b981',
    handlePattern: 'both',
  },{
    id: 'default-3',
    label: '出力ノード',
    color: '#ef4444',
    handlePattern: 'top'
  }];

  // アイテムのスタイルを「横いっぱいに広がる縦並び用」に調整
  const nodeItemStyle =
    'block p-3 m-2 bg-white border border-gray-300 rounded cursor-grab hover:bg-gray-50 text-xs text-center shadow-sm select-none transition-all active:scale-95';

    return (
    <div className="h-full bg-gray-100">
      <div className="p-4 text-center border-b border-gray-300 bg-white">
        <h2 className="font-bold text-gray-700">パーツパレット</h2>
      </div>
      {/* 基本ノードセクション */}
      <SectionHeader
        title="基本ノード"
        isOpen={basicOpen}
        toggle={() => setBasicOpen(!basicOpen)}
      />
      <SectionBody
        open={basicOpen}
        item={defaultPressets}
        textStyle={nodeItemStyle}
      />

      {/* プリセットセクション */}
      <SectionHeader
        title={`マイ・プリセット`}
        isOpen={presetsOpen}
        toggle={() => setPresetsOpen(!presetsOpen)}
      />
      {<SectionBody 
        open={presetsOpen}
        item={presets}
        textStyle={nodeItemStyle}      
      />}

      {/* --- 最下部のデータ管理エリア --- */}
      <div style={{position:'fixed', bottom:'0'}}>
        <div className="text-[10px] font-bold text-gray-400 mb-1 uppercase text-center tracking-widest">
          Edit Data
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSave}
            className="p-2 bg-blue-500 text-white rounded text-[10px] hover:bg-blue-600 font-bold transition-all active:scale-95"
          >
            一時保存
          </button>
          <button
            onClick={onRestore}
            className="p-2 bg-green-500 text-white rounded text-[10px] hover:bg-green-600 font-bold transition-all active:scale-95"
          >
            読み込み
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExport}
            className="p-2 border border-blue-500 text-blue-500 rounded text-[10px] hover:bg-blue-50 transition-all active:scale-95"
          >
            JSON書き出し
          </button>
          <button
            onClick={() => fileInputRef.current.click()}
            className="p-2 border border-green-500 text-green-500 rounded text-[10px] hover:bg-green-50 transition-all active:scale-95"
          >
            JSON読み込み
          </button>
          {/* 非表示のファイル入力 */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImport}
            accept=".json"
            hidden
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
