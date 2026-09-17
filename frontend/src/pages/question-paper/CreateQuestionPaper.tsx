import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SchoolIcon from '@mui/icons-material/School';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CreateQuestionPaper = () => {
  const navigate = useNavigate();
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState<
  { id: string; name: string; classNo: number }[]
>([]);
const [subjects, setSubjects] = useState<
  { id: string; name: string }[]
>([]);
  const [medium, setMedium] = useState('ENGLISH');
  const [subjectId, setSubjectId] = useState<string>("");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [chapters, setChapters] = useState<
  {
    id: string;
    name: string;
    chapterNo: number;
    subjectId: string;
  }[]
>([]);

  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | "">(60);

  const [mcqCount, setMcqCount] = useState(10);
  const [mcqMarks, setMcqMarks] = useState(1);

  const [shortCount, setShortCount] = useState(5);
  const [shortMarks, setShortMarks] = useState(2);

  const [longCount, setLongCount] = useState(3);
  const [longMarks, setLongMarks] = useState(5);

  const [tuitionName, setTuitionName] = useState('');
  const [tuitionLogoUrl, setTuitionLogoUrl] = useState<string | null>(null);


  /*
   * TEMPORARY
   *
   * This will be loaded automatically from the logged-in
   * Class Owner's tuition through the backend.
   *
   * We will connect this after confirming your existing
   * getMe/user API endpoint.
   */


  // const tuitionName = 'ABC Tuition Classes';
 useEffect(() => {
  const loadTuitionDetails = async () => {
    try {
      const response = await api.get("/users/me");

      console.log("USERS ME RESPONSE:", response.data);

      const tuition = response.data.tuition;

      if (!tuition) {
        console.log("No tuition found");
        return;
      }

      console.log("TUITION:", tuition);
      console.log("LOGO STORAGE KEY:", tuition.logoStorageKey);

      setTuitionName(tuition.name);

      if (tuition.logoStorageKey) {
        const logoResponse = await api.get(
          `/storage/${tuition.logoStorageKey}`,
          {
            responseType: "blob",
          },
        );

        console.log("LOGO RESPONSE:", logoResponse);
        console.log("LOGO BLOB:", logoResponse.data);

        const logoUrl = URL.createObjectURL(
          logoResponse.data,
        );

        console.log("LOGO URL:", logoUrl);

        setTuitionLogoUrl(logoUrl);
      }
    } catch (error) {
      console.error("FAILED TO LOAD TUITION:", error);
    }
  };

  loadTuitionDetails();
}, []);

//for classes
useEffect(() => {
  const loadClasses = async () => {
    try {
      const response = await api.get('/classes');

      console.log('CLASSES RESPONSE:', response.data);

      setClasses(response.data);
    } catch (error) {
      console.error('FAILED TO LOAD CLASSES:', error);
    }
  };

  loadClasses();
}, []);

//for subjects
useEffect(() => {
  if (!classId) {
    setSubjects([]);
    setSubjectId('');
    return;
  }

  const loadSubjects = async () => {
    try {
      const response = await api.get(`/subjects/class/${classId}`);

      console.log('SUBJECTS RESPONSE:', response.data);

      setSubjects(response.data);
    } catch (error) {
      console.error('FAILED TO LOAD SUBJECTS:', error);
      setSubjects([]);
    }
  };

  loadSubjects();
}, [classId]);
  
//for chapters
useEffect(() => {
  if (!subjectId) {
    setChapters([]);
    setSelectedChapters([]);
    return;
  }

  const loadChapters = async () => {
    try {
      console.log("SELECTED SUBJECT ID:", subjectId);

      const response = await api.get(
        `/chapters/subject/${subjectId}`,
      );

      console.log("CHAPTERS RESPONSE:", response.data);

      setChapters(response.data);
    } catch (error: any) {
      console.error("FAILED TO LOAD CHAPTERS:", error);
      console.error("STATUS:", error.response?.status);
      console.error("ERROR DATA:", error.response?.data);

      setChapters([]);
    }
  };

  loadChapters();
}, [subjectId]);

  const mcqTotal = mcqCount * mcqMarks;
  const shortTotal = shortCount * shortMarks;
  const longTotal = longCount * longMarks;

  const totalMarks = mcqTotal + shortTotal + longTotal;
  const totalQuestions = mcqCount + shortCount + longCount;

  const handleSubjectChange = (value: string) => {
    setSubjectId(value);

    // Chapters belong to a subject.
    // Clear old chapter selections when subject changes.
    setSelectedChapters([]);
  };

const handleGenerate = async () => {
  try {
    // Basic validation
    if (!title.trim()) {
      alert("Please enter a paper title.");
      return;
    }

    if (!classId) {
      alert("Please select a class.");
      return;
    }

    if (!subjectId) {
      alert("Please select a subject.");
      return;
    }

    if (selectedChapters.length === 0) {
      alert("Please select at least one chapter.");
      return;
    }

    if (!durationMinutes || durationMinutes <= 0) {
      alert("Please enter a valid duration.");
      return;
    }

    if (totalQuestions === 0) {
      alert("Please add at least one question.");
      return;
    }

    const payload = {
      title: title.trim(),
      medium,
      classId,
      subjectId,
      chapterIds: selectedChapters,
      totalMarks,
      durationMinutes,
      sections: [
        {
          type: "MCQ",
          count: mcqCount,
          marks: mcqMarks,
        },
        {
          type: "SHORT_ANSWER",
          count: shortCount,
          marks: shortMarks,
        },
        {
          type: "LONG_ANSWER",
          count: longCount,
          marks: longMarks,
        },
      ],
    };

    console.log("GENERATE PAPER PAYLOAD:", payload);

    const response = await api.post(
      "/question-papers/generate",
      payload,
    );

    console.log("GENERATE PAPER RESPONSE:", response.data);
    const paperId=response.data?.paperId;
    navigate(`/question-papers/${paperId}`);

   // alert("Question paper generated successfully!");

  } catch (error: any) {
    console.error("GENERATE PAPER ERROR:", error);

    console.error(
      "STATUS:",
      error.response?.status,
    );

    console.error(
      "BACKEND ERROR:",
      error.response?.data,
    );

    alert(
      error.response?.data?.message ||
        "Failed to generate question paper.",
    );
  }
};


  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: 'auto',
        pb: 4,
      }}
    >
      {/* ================= PAGE HEADER ================= */}

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: '#172B4D',
            letterSpacing: '-0.5px',
          }}
        >
          Create Question Paper
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.7,
            maxWidth: 700,
          }}
        >
          Create a question paper by selecting the class, subject, chapters and
          question pattern.
        </Typography>
      </Box>

      {/* ================= BASIC INFORMATION ================= */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: '1px solid #E6EAF0',
          boxShadow: '0 2px 10px rgba(23, 43, 77, 0.05)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: '#172B4D', mb: 0.5 }}
          >
            Basic Information
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the basic details of your question paper.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '2fr 1fr',
              },
              gap: 2.5,
            }}
          >
            {/* Tuition Name and Logo*/}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                p: 2,
                border: '1px solid #E6EAF0',
                borderRadius: 2,
                backgroundColor: '#F8FAFC',
              }}
            >
              {/* Tuition Logo */}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  border: '1px solid #D9E0E8',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {tuitionLogoUrl ? (
                  <Box
                    component="img"
                    src={tuitionLogoUrl}
                    alt="Tuition logo"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      p: 1,
                    }}
                  />
                ) : (
                  <SchoolIcon
                    sx={{
                      fontSize: 34,
                      color: '#176B72',
                    }}
                  />
                )}
              </Box>

              {/* Tuition Name */}
              <TextField
                fullWidth
                label="Tuition Name"
                value={tuitionName}
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
              />
            </Box>

            {/* Paper Title */}

            <TextField
              fullWidth
              label="Paper Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science Unit Test 1"
            />

            {/* Medium */}

            <FormControl fullWidth>
              <InputLabel>Medium</InputLabel>

              <Select
                value={medium}
                label="Medium"
                onChange={(e) => setMedium(e.target.value)}
              >
                <MenuItem value="ENGLISH">English</MenuItem>
                <MenuItem value="MARATHI">Marathi</MenuItem>
              </Select>
            </FormControl>

            {/* Class */}

            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>

              <Select
                value={classId}
                label="Class"
                onChange={(e) => setClassId(e.target.value)}
              >
                {classes.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Subject */}

                <FormControl fullWidth>
  <InputLabel id="subject-label">Subject</InputLabel>

  <Select
    labelId="subject-label"
    value={subjectId}
    label="Subject"
    onChange={(e) => {
      const value = e.target.value;

      console.log("SELECTED SUBJECT ID:", value);

      setSubjectId(value);
    }}
    disabled={!classId}
  >
    {subjects.map((subject) => (
      <MenuItem key={subject.id} value={subject.id}>
        {subject.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>

            {/* Duration */}

            <TextField
  fullWidth
  label="Duration"
  type="number"
  value={durationMinutes}
  onChange={(e) => {
    const value = e.target.value;

    setDurationMinutes(
      value === "" ? "" : Number(value)
    );
  }}
  slotProps={{
    input: {
      endAdornment: (
        <Typography color="text.secondary" sx={{ mr: 1 }}>
          min
        </Typography>
      ),
    },
  }}
/>
          </Box>
        </CardContent>
      </Card>

      {/* ================= CHAPTERS ================= */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: '1px solid #E6EAF0',
          boxShadow: '0 2px 10px rgba(23, 43, 77, 0.05)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#172B4D' }}>
            Chapters
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 2.5 }}
          >
            Select one or more chapters from the selected subject.
          </Typography>

          <Divider sx={{ mb: 2.5 }} />

          <FormControl fullWidth>
            <InputLabel id="chapters-label">Select Chapters</InputLabel>

            <Select
              labelId="chapters-label"
              multiple
              value={selectedChapters}
              onChange={(e) => {
                const value = e.target.value;

                setSelectedChapters(
                  typeof value === 'string' ? value.split(',') : value,
                );
              }}
              input={<OutlinedInput label="Select Chapters" />}
              IconComponent={KeyboardArrowDownIcon}
              renderValue={(selected) => (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.8,
                  }}
                >
                  {(selected as string[]).map((chapterId) => {
                    const chapter = chapters.find(
                      (item) => item.id === chapterId,
                    );

                    return (
                      <Chip
                        key={chapterId}
                        label={chapter?.name ?? chapterId}
                        size="small"
                        sx={{
                          backgroundColor: '#E8F3F5',
                          color: '#176B72',
                          fontWeight: 600,
                        }}
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    boxShadow: '0 8px 30px rgba(23, 43, 77, 0.12)',
                  },
                },
              }}
            >
              {chapters.map((chapter) => (
                <MenuItem
                  key={chapter.id}
                  value={chapter.id}
                  sx={{
                    borderRadius: 1,
                    mx: 0.5,
                    my: 0.2,
                  }}
                >
                  {chapter.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedChapters.length === 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1 }}
            >
              You can select multiple chapters.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* ================= QUESTION CONFIGURATION ================= */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: '1px solid #E6EAF0',
          boxShadow: '0 2px 10px rgba(23, 43, 77, 0.05)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#172B4D' }}>
            Question Configuration
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 3 }}
          >
            Define how many questions of each type should be included.
          </Typography>

          {/* Column Headers */}

          <Box
            sx={{
              display: {
                xs: 'none',
                md: 'grid',
              },
              gridTemplateColumns: 'minmax(180px, 1.5fr) 1fr 1fr 1fr',
              gap: 2,
              px: 1.5,
              mb: 1,
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
            >
              QUESTION TYPE
            </Typography>

            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
            >
              NO. OF QUESTIONS
            </Typography>

            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
            >
              MARKS / QUESTION
            </Typography>

            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
            >
              TOTAL MARKS
            </Typography>
          </Box>

          {/* MCQ */}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'minmax(180px, 1.5fr) 1fr 1fr 1fr',
              },
              gap: 2,
              alignItems: 'center',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: '#F8FAFC',
              border: '1px solid #EEF1F5',
              mb: 1,
            }}
          >
            <Typography fontWeight={600} sx={{ color: '#172B4D' }}>
              MCQ
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="Questions"
              type="number"
              value={mcqCount}
              onChange={(e) => setMcqCount(Number(e.target.value))}
              slotProps={{
                htmlInput: {
                  min: 0,
                },
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Marks"
              type="number"
              value={mcqMarks}
              onChange={(e) => setMcqMarks(Number(e.target.value))}
              slotProps={{
                htmlInput: {
                  min: 0,
                },
              }}
            />

            <Typography
              fontWeight={700}
              sx={{
                textAlign: {
                  xs: 'left',
                  md: 'center',
                },
                color: '#176B72',
              }}
            >
              {mcqTotal}
            </Typography>
          </Box>

          {/* SHORT ANSWER */}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'minmax(180px, 1.5fr) 1fr 1fr 1fr',
              },
              gap: 2,
              alignItems: 'center',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: '#F8FAFC',
              border: '1px solid #EEF1F5',
              mb: 1,
            }}
          >
            <Typography fontWeight={600} sx={{ color: '#172B4D' }}>
              Short Answer
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="Questions"
              type="number"
              value={shortCount}
              onChange={(e) => setShortCount(Number(e.target.value))}
              slotProps={{
                htmlInput: {
                  min: 0,
                },
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Marks"
              type="number"
              value={shortMarks}
              onChange={(e) => setShortMarks(Number(e.target.value))}
              slotProps={{
                htmlInput: {
                  min: 0,
                },
              }}
            />

            <Typography
              fontWeight={700}
              sx={{
                textAlign: {
                  xs: 'left',
                  md: 'center',
                },
                color: '#176B72',
              }}
            >
              {shortTotal}
            </Typography>
          </Box>

          {/* LONG ANSWER */}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'minmax(180px, 1.5fr) 1fr 1fr 1fr',
              },
              gap: 2,
              alignItems: 'center',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: '#F8FAFC',
              border: '1px solid #EEF1F5',
            }}
          >
            <Typography fontWeight={600} sx={{ color: '#172B4D' }}>
              Long Answer
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="Questions"
              type="number"
              value={longCount}
              onChange={(e) => setLongCount(Number(e.target.value))}
              slotProps={{
                htmlInput: {
                  min: 0,
                },
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Marks"
              type="number"
              value={longMarks}
              onChange={(e) => setLongMarks(Number(e.target.value))}
              slotProps={{
                htmlInput: {
                  min: 0,
                },
              }}
            />

            <Typography
              fontWeight={700}
              sx={{
                textAlign: {
                  xs: 'left',
                  md: 'center',
                },
                color: '#176B72',
              }}
            >
              {longTotal}
            </Typography>
          </Box>

          {/* Summary */}

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              backgroundColor: '#F4F7FA',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Questions
              </Typography>

              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: '#172B4D' }}
              >
                {totalQuestions}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Total Marks
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: '#176B72' }}
              >
                {totalMarks}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ================= ACTION ================= */}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          pb: 4,
        }}
      >
        <Button
          variant="outlined"
          size="large"
          sx={{
            minWidth: 110,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          size="large"
          onClick={handleGenerate}
          sx={{
            minWidth: 220,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            backgroundColor: '#176B72',
            '&:hover': {
              backgroundColor: '#12575D',
            },
          }}
        >
          Generate Question Paper
        </Button>
      </Box>
    </Box>
  );
};

export default CreateQuestionPaper;
