import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, CheckCircle, XCircle } from 'lucide-react';

interface ClassStatsProps {
    totalClasses: number;
    activeClasses: number;
    draftClasses: number;
    completedClasses: number;
}

export const ClassStats = ({ totalClasses, activeClasses, draftClasses, completedClasses }: ClassStatsProps) => {
    const stats = [
        {
            title: 'Tổng số lớp',
            value: totalClasses,
            icon: BookOpen,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            title: 'Đang hoạt động',
            value: activeClasses,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            title: 'Nháp',
            value: draftClasses,
            icon: Users,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        },
        {
            title: 'Hoàn thành',
            value: completedClasses,
            icon: XCircle,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg`}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

