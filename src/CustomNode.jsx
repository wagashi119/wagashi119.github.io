import React, { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, id, selected }) => {
  const onChangeName = useCallback(
    (evt) => {
      if (data.onChange) {
        data.onChange(id, evt.target.value, 'label');
      }
    },
    [id, data]
  );

  const onChangeColor = useCallback(
    (evt) => {
      if (data.onChange) {
        data.onChange(id, evt.target.value, 'color');
      }
    },
    [id, data]
  );

  const pattern = data.handlePattern || 'both';
  // デフォルトのノードスタイルを再現しつつ、動的に色を変えられるようにします
  const nodeStyle = {
    background: '#fff',
    color: '#222',
    padding: '10px',
    borderRadius: '3px',
    width: '150px',
    fontSize: '12px',
    textAlign: 'center',
    border: `1.5px solid ${selected ? '#333' : data.color || '#1a192b'}`, // 選択時は黒、それ以外は設定色
    boxShadow: selected ? '0 0 10px rgba(0,0,0,0.1)' : 'none',
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <div style={nodeStyle}>
      {/* 接続点（Handle）もデフォルトに近いスタイルに */}
      {(pattern === 'both' || pattern === 'top') && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#555' }}
        />
      )}

      <div style={{ fontWeight: 'bold', marginBottom: selected ? '8px' : '0' }}>
      {selected && (
          <input
          className="nodrag"
          type="text"
          defaultValue={data.label}
          onChange={onChangeName}
          style={{height:'10%' ,width:'100%', textAlign:'center', border:'none', outline:'none', fontWeight: 'bold'}}
        />
        ) ||
        data.label || 'Node'}
      </div>

      {/* 選択時のみ表示される最小限の設定UI */}
      {selected && (
        <div
        style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '9px', color: '#888' }}>Color:</span>
            <input
              className="nodrag"
              type="color"
              defaultValue={data.color || '#3b82f6'}
              onChange={onChangeColor}
              style={{
                width: '20px',
                height: '20px',
                border: 'none',
                padding: '0',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      )}

      {(pattern === 'both' || pattern === 'bottom') && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#555' }}
        />
      )}
    </div>
  );
};

export default CustomNode;
