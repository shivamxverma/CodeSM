import React, { useEffect, useState } from 'react';
import { usePostHog } from '@posthog/react';
import { getAllDiscussion } from '@/api/api';

const DiscussionPage = () => {
  const posthog = usePostHog();
  const [discussion, setDiscussion] = useState([{
    _id: 1, content: "your name is shivam", like: 1, dislike: 3
  }]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: ""
  })

  useEffect(() => {
    posthog.capture("discussion_page_viewed");
  }, [posthog]);

  const Field = ({ label, hint, children }) => (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );

  // useEffect(()=> {
  //   async function fetchDiscussion(){
  //     try{
  //       const response = await getAllDiscussion();
  //       setDiscussion(response.data.message);
  //     }catch(error){
  //       console.error(error);
  //     }
  //   } 
  //   fetchDiscussion();
  // },[])

  const handleDiscussionCreation = () => {
    posthog.capture("discussion_creation_attempt", { title: formData.title });
  };

  return (
    <>

      <form onSubmit={handleDiscussionCreation}>
        <Field label="Title">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder='Enter Title For Discussion'
            required
          />
        </Field>

        <Field
          label="description"
        >
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder='Give the Description'
            required
          />
        </Field>
      </form>

      <button
        onClick={handleDiscussionCreation}
        className='border-black-400 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white active:bg-purple-700'>+Create Discussion</button>
      <div>
        {discussion.map(dis => (
          <div key={dis._id}>
            <h1>{dis.content}</h1>
            <p>{dis.like}</p>
            <p>{dis.dislike}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default DiscussionPage;