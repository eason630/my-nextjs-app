"use client"

import { useCommissionStore } from '@/store/commission'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useMemo } from 'react'

function calcCommission(profit: number) {
	// 阶梯提成
	let commission = 0
	let detail = ''
	let brackets = [
		{ min: 0, max: 10000, rate: 0.05 },
		{ min: 10000, max: 25000, rate: 0.073 },
		{ min: 25000, max: 40000, rate: 0.138 },
		{ min: 40000, max: Infinity, rate: 0.21 },
	]
	let left = profit
	for (const { min, max, rate } of brackets) {
		if (profit > min) {
			let range = Math.min(max - min, left)
			let part = range * rate
			commission += part
			detail += `${min}～${max === Infinity ? '∞' : max}：${(rate * 100).toFixed(1)}% = ${part.toFixed(2)}\n`
			left -= range
			if (left <= 0) break
		}
	}
	return { commission, detail }
}

function calcAll(person: { profit: number }) {
	const baseSalary = 3500
	const { commission, detail } = calcCommission(person.profit)
	const tax = 0.3 * commission
	const cost = 1550
	const final = baseSalary + commission - tax - cost
	return {
		baseSalary,
		commission,
		tax,
		cost,
		final,
		detail,
	}
}

export default function CommissionPage() {
	const { people, addPerson, removePerson, updatePerson, reset } = useCommissionStore()

	const peopleWithResult = useMemo(() =>
		people.map(p => ({ ...p, result: calcAll(p) })),
		[people]
	)

	return (
		<main className="flex min-h-screen flex-col items-center bg-gray-50 py-8">
			<Card className="w-full max-w-3xl">
				<CardHeader>
					<CardTitle className="text-2xl">提成计算工具 <Badge>多人员</Badge></CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						{people.map((person, idx) => (
							<div key={person.id} className="flex items-end gap-4 bg-gray-100 p-4 rounded-lg">
								<div className="flex-1">
									<Label htmlFor={`name-${person.id}`}>姓名</Label>
									<Input
										id={`name-${person.id}`}
										placeholder="请输入姓名"
										value={person.name}
										onChange={e => updatePerson(person.id, { name: e.target.value })}
										className="mt-1"
									/>
								</div>
								<div className="flex-1">
									<Label htmlFor={`month-${person.id}`}>月份</Label>
									<Input
										type="month"
										id={`month-${person.id}`}
										value={person.month}
										onChange={e => updatePerson(person.id, { month: e.target.value })}
										className="mt-1"
									/>
								</div>
								<div className="flex-1">
									<Label htmlFor={`profit-${person.id}`}>利润（元）</Label>
									<Input
										id={`profit-${person.id}`}
										type="number"
										min={0}
										placeholder="请输入利润"
										value={person.profit === 0 ? '' : person.profit}
										onChange={e => {
											const val = parseFloat(e.target.value)
											updatePerson(person.id, { profit: isNaN(val) ? 0 : val })
										}}
										className="mt-1"
									/>
								</div>
								<Button
									variant="destructive"
									size="icon"
									className="mb-1"
									onClick={() => {
										if (people.length === 1) {
											toast.error('至少保留一人')
											return
										}
										removePerson(person.id)
										toast.success('已删除')
									}}
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						))}
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => {
									addPerson()
									toast.success('已添加人员')
								}}
							>
								<Plus className="w-4 h-4 mr-1" /> 添加人员
							</Button>
							<Button
								variant="ghost"
								onClick={() => {
									reset()
									toast.success('已重置')
								}}
							>
								<RefreshCcw className="w-4 h-4 mr-1" /> 重置
							</Button>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex-col items-start gap-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>姓名</TableHead>
								<TableHead>月份</TableHead>
								<TableHead>利润</TableHead>
								<TableHead>基本工资</TableHead>
								<TableHead>提成</TableHead>
								<TableHead>个税</TableHead>
								<TableHead>社保+成本</TableHead>
								<TableHead>最终到手</TableHead>
								<TableHead>详情</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{peopleWithResult.map((p, idx) => (
								<TableRow key={p.id}>
									<TableCell>{p.name || <span className="text-gray-400">未填写</span>}</TableCell>
									<TableCell>{p.month}</TableCell>
									<TableCell>{p.profit}</TableCell>
									<TableCell>{p.result.baseSalary}</TableCell>
									<TableCell>{p.result.commission.toFixed(2)}</TableCell>
									<TableCell>{p.result.tax.toFixed(2)}</TableCell>
									<TableCell>{p.result.cost}</TableCell>
									<TableCell className="font-bold text-green-600">{p.result.final.toFixed(2)}</TableCell>
									<TableCell>
										<pre className="whitespace-pre-wrap text-xs text-gray-500 leading-tight">{p.result.detail}</pre>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<div className="text-gray-500 text-xs mt-2">
						计算规则：<br />
						基本工资 3500 元，利润阶梯提成，个税 30%，社保+固定成本 1550 元。<br />
						<span className="text-red-500">仅供演示，实际以公司政策为准。</span>
					</div>
				</CardFooter>
			</Card>
		</main>
	)
}
