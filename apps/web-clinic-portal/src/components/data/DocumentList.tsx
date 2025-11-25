import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useToast } from '../toast/ToastProvider';

export type DocumentRow = {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size?: string;
};

type Props = {
  items: DocumentRow[];
};

export function DocumentList({ items }: Props) {
  const toast = useToast();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    toast.push({ message: `Uploaded ${file.name} (stub)`, tone: 'success' });
  };

  return (
    <Card tone="glass" padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Documents</p>
          <p className="text-lg font-semibold text-white">Files & attachments</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleUpload} />
          <Button as="span">Upload</Button>
        </label>
      </div>
      <div className="divide-y divide-white/5">
        {items.map((doc) => (
          <div key={doc.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{doc.name}</p>
              <p className="text-xs text-slate-400">
                {doc.type} • {doc.size ?? '—'} • {new Date(doc.uploadedAt).toLocaleString()}
              </p>
            </div>
            <Button as="a" href="#" variant="ghost" size="md">
              Download
            </Button>
          </div>
        ))}
        {items.length === 0 && <div className="py-6 text-sm text-slate-400">No documents yet.</div>}
      </div>
    </Card>
  );
}
