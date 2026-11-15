export default function PageHeader({ title, description }) {
  return <header className="mb-4"><h1 className="h3 brand">{title}</h1>{description && <p className="text-secondary mb-0">{description}</p>}</header>;
}
