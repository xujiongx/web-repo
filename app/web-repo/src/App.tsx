import { Button, Space } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import { IconPlus, IconDelete } from "@arco-design/web-react/icon";
import "./App.css";

const App = () => {
  return (
    <Space size="large">
      <Button type="primary" icon={<IconPlus />} />
      <Button type="primary" icon={<IconDelete />}>
        Delete
      </Button>
    </Space>
  );
};

export default App;
