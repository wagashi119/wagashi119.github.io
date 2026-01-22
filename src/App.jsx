import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  useReactFlow, // 追加
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode';
import Sidebar from './Sidebar';
import './index.css';
import Border from './Border';

let id = 0;
const getId = () => `dndnode_${id++}`;

const initialNodes = [
  {
    id: '1',
    type: 'custom',
    data: {
      label: '開始ノード',
      color: '#3b82f6',
      handlePattern: 'bottom',
    },
    position: { x: 250, y: 5 },
  },
];

const nodeTypes = {
  custom: CustomNode, // 'custom' という名前で登録
};

// 内部ロジックを分離
const FlowEditor = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow(); // フックから座標変換関数を取得
  const [presets, setPresets] = useState([]);
  const { setViewport, toObject } = useReactFlow();

  const onNodeDataChange = useCallback(
    (nodeId, value, field) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // 指定したノードの data 属性を書き換える
            return {
              ...node,
              data: {
                ...node.data,
                [field]: value,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // ノードを右クリックした時の処理
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault(); // ブラウザ標準のメニューを禁止

    const presetName = prompt(
      'このノードをプリセットとして保存します。名前を入力してください:',
      node.data.label
    );
    if (!presetName) return;

    const newPreset = {
      id: `preset-${Date.now()}`,
      label: presetName,
      color: node.data.color || '#3b82f6',
      handlePattern: node.data.handlePattern || 'both',
    };

    setPresets((prev) => [...prev, newPreset]);
    alert(
      `プリセット「${presetName}」を登録しました！左のサイドバーを確認してください。`
    );
  }, []);

  // onDropの中でプリセットからのデータにも対応させる
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const presetDataRaw = event.dataTransfer.getData(
        'application/reactflow-preset'
      );

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let nodeData = {
        label: '新規ノード',
        color: '#3b82f6',
        handlePattern: 'both',
      };

      if (presetDataRaw) {
        const preset = JSON.parse(presetDataRaw);
        nodeData = { ...preset };
      }

      const newNode = {
        id: getId(),
        type: 'custom',
        position,
        data: { ...nodeData, onChange: onNodeDataChange },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, onNodeDataChange]
  );

  const onSave = useCallback(() => {
    const flow = toObject();
    const saveData = {
      flow: flow,
      presets: presets, // プリセットも一緒に保存
    };
    localStorage.setItem('workflow-data', JSON.stringify(saveData));
    alert('ブラウザに保存しました！');
  }, [toObject, presets]);

  // --- 読み込み共通処理 ---
  const applyData = useCallback(
    (data) => {
      if (data && data.flow) {
        const { x = 0, y = 0, zoom = 1 } = data.flow.viewport;
        setNodes(data.flow.nodes || []);
        setEdges(data.flow.edges || []);
        setPresets(data.presets || []); // プリセットを復元
        setViewport({ x, y, zoom });
        return true;
      }
      return false;
    },
    [setNodes, setEdges, setPresets, setViewport]
  );

  // --- ブラウザから読み込み ---
  const onRestore = useCallback(() => {
    const saved = localStorage.getItem('workflow-data');
    if (saved) {
      const data = JSON.parse(saved);
      if (applyData(data)) alert('保存されたデータを読み込みました');
    } else {
      alert('保存データが見つかりません');
    }
  }, [applyData]);

  // --- JSONファイルで読み込み (Import) ---
  const onImport = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (applyData(data)) {
            alert('JSONファイルを読み込みました');
          } else {
            alert('無効なファイル形式です');
          }
        } catch (err) {
          alert('ファイルの解析に失敗しました:' + err);
        }
      };
      reader.readAsText(file);
    },
    [applyData]
  );

  // --- JSONとして書き出し (Export) ---
  const onExport = useCallback(() => {
    const saveData = {
      flow: toObject(),
      presets: presets,
    };
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(saveData));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'workflow_complete.json');
    link.click();
  }, [toObject, presets]);

  return (
    <div className="flex h-screen w-screen">
      <div className="w-1/5 bg-gray-100 border-gray-300">
        <Sidebar
        presets={presets}
        onSave={onSave}
        onExport={onExport}
        onImport={onImport}
        onRestore={onRestore}
        />
      </div>
      <Border/>

      {/* ここで onDragOver と onDrop を div にも付与するのがコツ */}
      <div
        className="flex-grow h-full"
        ref={reactFlowWrapper}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeContextMenu={onNodeContextMenu}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

// メインコンポーネントで Provider を外側に配置
const App = () => (
  <ReactFlowProvider>
    <FlowEditor />
  </ReactFlowProvider>
);

export default App;
