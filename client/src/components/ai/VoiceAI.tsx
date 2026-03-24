import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2, FileAudio, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { trackAIFeature } from '@/lib/analytics';
import { toast } from 'sonner';

interface VoiceAIProps {
  onTranscription?: (text: string) => void;
  className?: string;
}

/**
 * Voice AI component for speech-to-text transcription
 * Features: real-time recording, file upload, transcription
 */
export function VoiceAI({ onTranscription, className = '' }: VoiceAIProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        setAudioFile(file);
        await handleTranscribe(file);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      trackAIFeature('voice_ai', 'start_recording', {});
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      trackAIFeature('voice_ai', 'stop_recording', { duration: recordingTime });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (16MB limit)
      if (file.size > 16 * 1024 * 1024) {
        toast.error('File size must be less than 16MB');
        return;
      }

      // Check file type
      const validTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mpeg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload an audio file.');
        return;
      }

      setAudioFile(file);
      handleTranscribe(file);
      trackAIFeature('voice_ai', 'file_uploaded', { fileSize: file.size, fileType: file.type });
    }
  };

  const handleTranscribe = async (file: File) => {
    setIsProcessing(true);
    trackAIFeature('voice_ai', 'transcribe_start', { fileSize: file.size });

    // Simulate transcription (replace with actual API call)
    setTimeout(() => {
      const mockTranscription = `This is a sample transcription of the audio file. In a real implementation, this would be the actual transcribed text from the speech-to-text API.

The transcription would include all spoken words, with proper punctuation and formatting. It would handle multiple speakers, background noise, and various accents.

Key features of the transcription service:
- High accuracy speech recognition
- Support for multiple languages
- Automatic punctuation and capitalization
- Speaker diarization
- Timestamp information`;

      setTranscription(mockTranscription);
      setIsProcessing(false);
      
      if (onTranscription) {
        onTranscription(mockTranscription);
      }

      toast.success('Transcription completed!');
      trackAIFeature('voice_ai', 'transcribe_complete', { 
        textLength: mockTranscription.length 
      });
    }, 3000);
  };

  const handleDownload = () => {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    trackAIFeature('voice_ai', 'download_transcription', {});
    toast.success('Downloaded!');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <FileAudio className="w-6 h-6 text-purple-700" />
        <h3 className="text-2xl font-bold text-gray-800">Voice AI</h3>
        <Badge variant="secondary">Speech-to-Text</Badge>
      </div>

      <div className="space-y-6">
        {/* Recording Controls */}
        <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
          <div className="relative">
            <Button
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-purple-700 hover:bg-purple-700'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </Button>
            {isRecording && (
              <div className="absolute -top-2 -right-2">
                <div className="w-6 h-6 bg-red-500 rounded-full animate-ping" />
              </div>
            )}
          </div>

          {isRecording && (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{formatTime(recordingTime)}</p>
              <p className="text-sm text-gray-600">Recording...</p>
            </div>
          )}

          {!isRecording && !isProcessing && (
            <p className="text-sm text-gray-600 text-center">
              Click the microphone to start recording
            </p>
          )}
        </div>

        {/* File Upload */}
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || isRecording}
            className="mt-4"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Audio File
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Supported: MP3, WAV, WEBM, OGG, M4A (Max 16MB)
          </p>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center p-8 bg-purple-50 rounded-lg">
            <Loader2 className="w-12 h-12 animate-spin text-purple-700 mb-4" />
            <p className="text-gray-700 font-medium">Transcribing audio...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
          </div>
        )}

        {/* Transcription Result */}
        {transcription && !isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">Transcription</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              rows={12}
              className="resize-none font-mono text-sm"
            />
            
            <p className="text-xs text-gray-500">
              {transcription.split(' ').length} words • {transcription.length} characters
            </p>
          </div>
        )}

        {audioFile && !isProcessing && (
          <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">{audioFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
