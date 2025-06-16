import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Trophy, Target, Star, Flame } from "lucide-react";

export default function UserProfile() {
  const generateStreakData = () => {
    const columns = [];
    const today = new Date();
    const totalWeeks = 12;

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const columnData = [];

      for (let week = totalWeeks - 1; week >= 0; week--) {
        const currentDate = new Date(today);
        const startOfWeek = currentDate.getDate() - currentDate.getDay();
        currentDate.setDate(startOfWeek - week * 7 + dayOfWeek);

        if (currentDate > today) {
          columnData.push({
            date: currentDate.getDate(),
            month: currentDate.getMonth(),
            fullDate: currentDate,
            problemsSolved: 0,
            isActive: false,
            isFuture: true,
          });
        } else {
          const isActive = Math.random() > 0.3;
          const problemsSolved = isActive
            ? Math.floor(Math.random() * 5) + 1
            : 0;

          columnData.push({
            date: currentDate.getDate(),
            month: currentDate.getMonth(),
            fullDate: currentDate,
            problemsSolved,
            isActive,
            isFuture: false,
          });
        }
      }

      columns.push(columnData);
    }

    return columns;
  };

  const streakColumns = generateStreakData();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentStreak = 15;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 gap-8 items-start">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  {/* User Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                        Shivamv_99
                      </h1>
                      <p className="text-slate-600 text-lg">
                        Shivam Verma • Nagpur, India
                      </p>
                      <p className="text-slate-500 mt-2">
                        From Indian Institute of Information Technology Nagpur
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        <Trophy className="w-4 h-4 mr-1" />
                        Pupil
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-green-200 text-green-700"
                      >
                        Online Now
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-center md:justify-end flex-shrink-0">
                    <div className="relative">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-orange-400 to-red-500">
                        <img
                          src="/profile-image.png"
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Trophy className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">
                            1238
                          </p>
                          <p className="text-sm text-slate-600">
                            Contest Rating
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">
                            452
                          </p>
                          <p className="text-sm text-slate-600">
                            Problems Solved
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Star className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">0</p>
                          <p className="text-sm text-slate-600">Contribution</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <CalendarDays className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">2</p>
                          <p className="text-sm text-slate-600">Years Active</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-800 mb-2">About</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Passionate competitive programmer from IIIT Nagpur.
                      Currently working towards improving my problem-solving
                      skills and contest ratings. Love tackling algorithmic
                      challenges and learning new techniques.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak Tracker */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-slate-800 text-lg">
              <Flame className="w-5 h-5 text-orange-500" />
              <span>Coding Streak</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Streak Display */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-xl">
                <Flame className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-xl font-bold text-slate-800">
                    {currentStreak}
                  </p>
                  <p className="text-xs text-slate-600">Day Streak</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 text-sm mb-2">
                Last 8 Weeks Activity
              </h4>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {dayLabels.map((day) => (
                  <div
                    key={day}
                    className="text-xs text-slate-500 text-center font-medium py-0.5"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {streakColumns.slice(0, 7).map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-col gap-px">
                    {column.slice(4).map((day, dayIndex) => (
                      <div
                        key={`${columnIndex}-${dayIndex}`}
                        className={`
                  aspect-square rounded-sm border transition-all duration-200 hover:scale-105 cursor-pointer w-4 h-4
                  ${
                    day.isFuture
                      ? "bg-slate-50 border-slate-100"
                      : day.isActive
                      ? day.problemsSolved >= 4
                        ? "bg-green-700 border-green-800"
                        : day.problemsSolved >= 3
                        ? "bg-green-600 border-green-700"
                        : day.problemsSolved >= 2
                        ? "bg-green-400 border-green-500"
                        : "bg-green-200 border-green-300"
                      : "bg-slate-100 border-slate-200"
                  }
                `}
                        title={
                          day.isFuture
                            ? "Future date"
                            : `${day.fullDate.toLocaleDateString()}: ${
                                day.problemsSolved
                              } problems solved`
                        }
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          {!day.isFuture && day.isActive && (
                            <span className="text-[10px] font-bold text-white opacity-0 hover:opacity-100 transition-opacity">
                              {day.problemsSolved}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-slate-600 flex-wrap gap-y-1">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-slate-100 border border-slate-200 rounded-sm"></div>
                  <span>No activity</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-200 border border-green-300 rounded-sm"></div>
                  <span>1-2</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 border border-green-500 rounded-sm"></div>
                  <span>2-3</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-600 border-green-700 rounded-sm"></div>
                  <span>3-4</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-700 border-green-800 rounded-sm"></div>
                  <span>4+</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
