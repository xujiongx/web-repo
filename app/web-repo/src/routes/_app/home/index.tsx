import { PageHeader, Radio } from '@arco-design/web-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/home/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <PageHeader
        style={{ background: "var(--color-bg-2)" }}
        title="首页"
        subTitle="This is a description"
        extra={
          <div>
            <Radio.Group mode="fill" type="button" defaultValue="small">
              <Radio value="large">Large</Radio>
              <Radio value="medium">Medium</Radio>
              <Radio value="small">Small</Radio>
            </Radio.Group>
          </div>
        }
      />
    </div>
  );
}
