// 詳細・編集画面（T-08で実装）
export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <h1>詳細・編集画面（T-08で実装） id={id}</h1>
}
