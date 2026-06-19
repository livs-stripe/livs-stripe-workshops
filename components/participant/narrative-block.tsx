export function NarrativeBlock({ text }: { text: string }) {
  return (
    <div
      className="mb-6 rounded-md px-5 py-4"
      style={{
        backgroundColor: '#F8F7FF',
        borderLeft: '3px solid #635BFF',
      }}
    >
      <p
        className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: '#635BFF' }}
      >
        Your situation
      </p>
      <p className="text-[14px] leading-[1.6]" style={{ color: '#425466' }}>
        {text}
      </p>
    </div>
  )
}
