import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import LoggedNavbar from '../components/LoggedNavbar';
import InformacionPersonal from '../components/InformacionPersonal';
import Formacion from '../components/Formacion';
import ExpLaboral from '../components/ExpLaboral';
import { Education, WorkExperience, CVFile, UserProfile, Achievement } from '../types';

type TabType = 'personal' | 'education' | 'experience';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [cvFile, setCvFile] = useState<CVFile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  useEffect(() => {
    checkUser();
    fetchEducation();
    fetchWorkExperience();
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_achievements') 
        .select(`
          user_achievements.achievement_id,
          earned_at,
          achievements!inner (
            id,
            name, 
            description
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedAchievements = data.map(item => ({
        id: item.achievements.id,
        name: item.achievements.name,
        description: item.achievements.description,
        earned_at: item.earned_at
      }));

      setAchievements(formattedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchEducation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_inicio', { ascending: false });

      if (error) throw error;
      setEducation(data || []);
    } catch (error) {
      console.error('Error fetching education:', error);
    }
  };

  const fetchWorkExperience = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('work_experience')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_inicio', { ascending: false });

      if (error) throw error;
      setWorkExperience(data || []);
    } catch (error) {
      console.error('Error fetching work experience:', error);
    }
  };

  const handleAddEducation = async (educationData: Omit<Education, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('education')
        .insert([{ ...educationData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setEducation(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding education:', error);
    }
  };

  const handleUpdateEducation = async (id: string, educationData: Omit<Education, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('education')
        .update(educationData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setEducation(prev => prev.map(edu => edu.id === id ? data : edu));
    } catch (error) {
      console.error('Error updating education:', error);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setEducation(prev => prev.filter(edu => edu.id !== id));
    } catch (error) {
      console.error('Error deleting education:', error);
    }
  };

  const handleAddWorkExperience = async (workData: Omit<WorkExperience, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('work_experience')
        .insert([{ ...workData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setWorkExperience(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding work experience:', error);
    }
  };

  const handleUpdateWorkExperience = async (id: string, workData: Omit<WorkExperience, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('work_experience')
        .update(workData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setWorkExperience(prev => prev.map(exp => exp.id === id ? data : exp));
    } catch (error) {
      console.error('Error updating work experience:', error);
    }
  };

  const handleDeleteWorkExperience = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('work_experience')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setWorkExperience(prev => prev.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Error deleting work experience:', error);
    }
  };

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('loggedusers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      // Set CV file info if it exists
      if (profile.cv_filename && profile.cv_updated_at) {
        setCvFile({
          filename: profile.cv_filename,
          lastUpdated: profile.cv_updated_at
        });
      }
      
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedNavbar />
      <div className="pt-24 pb-12 px-4">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-primary mb-8">Mi Perfil</h1>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === 'personal'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Información Personal
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === 'education'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Formación
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === 'experience'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Experiencia Laboral
            </button>
          </div>

          {userProfile && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Información Personal Tab */}
              {activeTab === 'personal' && (
                <InformacionPersonal
                  userProfile={userProfile}
                  cvFile={cvFile}
                  achievements={achievements}
                  onUpdateProfile={(updatedProfile) => {
                    setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
                  }}
                  onUpdateCV={setCvFile}
                />
              )}

              {/* Formación Tab */}
              {activeTab === 'education' && (
                <Formacion
                  education={education}
                  onAddEducation={handleAddEducation}
                  onUpdateEducation={handleUpdateEducation}
                  onDeleteEducation={handleDeleteEducation}
                />
              )}

              {/* Experiencia Laboral Tab */}
              {activeTab === 'experience' && (
                <ExpLaboral
                  workExperience={workExperience}
                  onAddWorkExperience={handleAddWorkExperience}
                  onUpdateWorkExperience={handleUpdateWorkExperience}
                  onDeleteWorkExperience={handleDeleteWorkExperience}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;