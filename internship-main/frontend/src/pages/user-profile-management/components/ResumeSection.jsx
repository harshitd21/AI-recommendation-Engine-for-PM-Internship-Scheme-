import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResumeSection = ({ profile, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const resumeHistory = [
    {
      id: 1,
      name: 'Resume_John_Doe_2024.pdf',
      uploadDate: '2024-01-15',
      size: '245 KB',
      status: 'current',
      extractedSkills: ['React', 'JavaScript', 'Python', 'SQL', 'Git']
    },
    {
      id: 2,
      name: 'Resume_John_Doe_v2.pdf',
      uploadDate: '2023-12-10',
      size: '238 KB',
      status: 'previous',
      extractedSkills: ['JavaScript', 'Python', 'HTML', 'CSS']
    },
    {
      id: 3,
      name: 'Resume_John_Doe_v1.pdf',
      uploadDate: '2023-11-05',
      size: '220 KB',
      status: 'previous',
      extractedSkills: ['Python', 'Java', 'HTML']
    }
  ];

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFileUpload(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFileUpload(e?.target?.files?.[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (file?.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    if (file?.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size should be less than 5MB.');
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate file upload and parsing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted skills from resume parsing
      const mockExtractedSkills = ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker'];
      
      const newResume = {
        id: Date.now(),
        name: file?.name,
        uploadDate: new Date()?.toISOString()?.split('T')?.[0],
        size: `${Math.round(file?.size / 1024)} KB`,
        status: 'current',
        extractedSkills: mockExtractedSkills
      };

      onUpdate('resume', {
        current: newResume,
        history: [newResume, ...resumeHistory?.map(r => ({ ...r, status: 'previous' }))]
      });

      // Show success message or update UI
      alert('Resume uploaded successfully! New skills have been extracted and added to your profile.');
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef?.current?.click();
  };

  const downloadResume = (resume) => {
    // Mock download functionality
    alert(`Downloading ${resume?.name}...`);
  };

  const revertToResume = (resume) => {
    if (window.confirm(`Are you sure you want to revert to ${resume?.name}? This will update your profile with the skills from this resume.`)) {
      onUpdate('resume', {
        current: { ...resume, status: 'current' },
        history: resumeHistory?.map(r => ({ 
          ...r, 
          status: r?.id === resume?.id ? 'current' : 'previous' 
        }))
      });
      alert('Resume reverted successfully!');
    }
  };

  const currentResume = resumeHistory?.find(r => r?.status === 'current');

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
            <Icon name="FileText" size={20} className="text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Resume Management</h3>
            <p className="text-sm text-muted-foreground">Upload and manage your resume files</p>
          </div>
        </div>
      </div>
      {/* Current Resume */}
      {currentResume && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Icon name="FileCheck" size={20} className="text-primary" />
              <div>
                <h4 className="font-medium text-foreground">Current Resume</h4>
                <p className="text-sm text-muted-foreground">{currentResume?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadResume(currentResume)}
                iconName="Download"
              >
                Download
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>Uploaded: {currentResume?.uploadDate}</span>
            <span>Size: {currentResume?.size}</span>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Extracted Skills:</p>
            <div className="flex flex-wrap gap-2">
              {currentResume?.extractedSkills?.map((skill, index) => (
                <span
                  key={index}
                  className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          dragActive
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto">
            <Icon name="Upload" size={24} className="text-muted-foreground" />
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-foreground mb-2">
              {isUploading ? 'Uploading and parsing...' : 'Upload New Resume'}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your PDF resume here, or click to browse
            </p>
            
            <Button
              variant="outline"
              onClick={openFileDialog}
              disabled={isUploading}
              loading={isUploading}
              iconName="Upload"
              iconPosition="left"
            >
              {isUploading ? 'Processing...' : 'Choose File'}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Supported format: PDF only</p>
            <p>Maximum file size: 5MB</p>
          </div>
        </div>
      </div>
      {/* Resume History */}
      {resumeHistory?.filter(r => r?.status === 'previous')?.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-foreground mb-4">Resume History</h4>
          <div className="space-y-3">
            {resumeHistory?.filter(r => r?.status === 'previous')?.map((resume) => (
                <div
                  key={resume?.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Icon name="File" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{resume?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {resume?.uploadDate} • {resume?.size}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadResume(resume)}
                      iconName="Download"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revertToResume(resume)}
                      iconName="RotateCcw"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      {/* Info Section */}
      <div className="mt-6 p-4 bg-warning/5 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-warning mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Resume Parsing</p>
            <p>When you upload a new resume, our AI will automatically extract skills and update your profile. This helps improve your internship recommendations and matching accuracy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeSection;