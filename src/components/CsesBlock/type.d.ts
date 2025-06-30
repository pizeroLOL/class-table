type ClassShortName = string;

type SubjectInfo = {
  simplified_name?: string;
  teacher?: string;
  room?: string;
};

type CurrentClass = {
  name: string;
  teacher?: string;
  room?: string;
  secs: number;
  end_time: number;
};

type CountDown = {
  left: ClassShortName[];
  current: CurrentClass[];
  right: ClassShortName[];
};

type ClassBlockTime = number;

type ClassBlock = {
  subject: string;
  teacher?: string;
  room?: string;
  simplified_name: string;
  start_time: ClassBlockTime;
  end_time: ClassBlockTime;
};
