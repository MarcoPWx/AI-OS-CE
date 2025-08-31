import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap, Flame, Target, Gift, TrendingUp, Award, Star } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  icon: React.ReactNode;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  xpReward: number;
}

interface UserStats {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  streakDays: number;
  quizzesCompleted: number;
  perfectScores: number;
  achievements: number;
}

export const GamificationDashboard: React.FC = () => {
  // Mock data for demonstration
  const userStats: UserStats = {
    level: 12,
    currentXP: 750,
    nextLevelXP: 1200,
    totalXP: 11750,
    streakDays: 7,
    quizzesCompleted: 142,
    perfectScores: 23,
    achievements: 5,
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first quiz',
      xpReward: 50,
      unlocked: true,
      icon: <Star className="h-5 w-5" />,
    },
    {
      id: '2',
      name: 'Perfectionist',
      description: 'Get a perfect score',
      xpReward: 100,
      unlocked: true,
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      id: '3',
      name: 'Week Warrior',
      description: 'Maintain 7-day streak',
      xpReward: 150,
      unlocked: true,
      icon: <Flame className="h-5 w-5" />,
    },
    {
      id: '4',
      name: 'Speed Demon',
      description: 'Complete quiz in <30s',
      xpReward: 200,
      unlocked: false,
      icon: <Zap className="h-5 w-5" />,
    },
    {
      id: '5',
      name: 'Quiz Master',
      description: 'Complete 100 quizzes',
      xpReward: 500,
      unlocked: true,
      icon: <Award className="h-5 w-5" />,
    },
  ];

  const dailyQuests: Quest[] = [
    {
      id: '1',
      title: 'Quick Learner',
      description: 'Complete 3 quizzes today',
      progress: 2,
      total: 3,
      xpReward: 100,
    },
    {
      id: '2',
      title: 'Perfect Day',
      description: 'Get 1 perfect score',
      progress: 0,
      total: 1,
      xpReward: 200,
    },
    {
      id: '3',
      title: 'Category Master',
      description: 'Complete 5 React quizzes',
      progress: 3,
      total: 5,
      xpReward: 150,
    },
  ];

  const xpProgress = (userStats.currentXP / userStats.nextLevelXP) * 100;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-3xl font-bold">{userStats.level}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <Progress value={xpProgress} className="mt-4" />
            <p className="text-xs text-muted-foreground mt-2">
              {userStats.currentXP} / {userStats.nextLevelXP} XP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-3xl font-bold">{userStats.streakDays} days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded ${
                    i < userStats.streakDays ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-3xl font-bold">{userStats.totalXP.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">Rank: Top 15%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-3xl font-bold">{userStats.achievements}/9</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={(userStats.achievements / 9) * 100} className="mt-4" />
          </CardContent>
        </Card>
      </div>

      {/* Daily Quests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Quests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dailyQuests.map((quest) => (
            <div key={quest.id} className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{quest.title}</h4>
                  <p className="text-sm text-muted-foreground">{quest.description}</p>
                </div>
                <span className="text-sm font-semibold text-primary">+{quest.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={(quest.progress / quest.total) * 100} className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  {quest.progress}/{quest.total}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border ${
                  achievement.unlocked
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      achievement.unlocked
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-sm font-semibold mt-1">+{achievement.xpReward} XP</p>
                  </div>
                  {achievement.unlocked && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Unlocked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reward Box */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Mystery Box Available!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your next quiz for a chance to win bonus XP and power-ups
              </p>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
              Start Quiz
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
