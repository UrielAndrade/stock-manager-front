import { useState } from 'react'
import { Settings, Server, Palette, Info } from 'lucide-react'
import { useSettingsStore } from '@/store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toaster'

export default function SettingsPage() {
  const { apiBaseUrl, setApiBaseUrl } = useSettingsStore()
  const toast = useToast()
  const [url, setUrl] = useState(apiBaseUrl)

  const handleSave = () => {
    setApiBaseUrl(url)
    toast.success('Settings saved', 'API URL updated. Refresh the page if needed.')
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Server className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure the backend API endpoint</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="API Base URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:8080"
            hint="The Vite dev server proxies /api → this URL automatically"
          />
          <Button onClick={handleSave} size="sm">Save Configuration</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20">
              <Info className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <CardTitle>About</CardTitle>
              <CardDescription>Application information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Application', value: 'Stock Manager Front' },
              { label: 'Version', value: '1.0.0' },
              { label: 'Backend', value: 'stock-manager-go (Go + Fuego + GORM)' },
              { label: 'Stack', value: 'React 19 + TypeScript + Vite + Tailwind CSS v4' },
              { label: 'Swagger UI', value: 'http://localhost:8080/swagger/index.html' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-300 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Palette className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <CardTitle>Business Rules Reference</CardTitle>
              <CardDescription>Key rules from the backend</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-400">
            {[
              'Orders start with status "pending" — must be executed or canceled',
              'Executing a BUY order DECREMENTS product stock (product leaves warehouse)',
              'Executing a SELL order INCREMENTS product stock (product enters warehouse)',
              'Only pending orders can be executed or canceled',
              'Execution fails if stock quantity < order quantity (buy type only)',
              'Brand emails must be unique across the system',
              'Foundation year must be > 1800',
              'User passwords require minimum 6 characters',
            ].map((rule, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-indigo-400 flex-shrink-0">→</span>
                {rule}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
