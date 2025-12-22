import prisma from '@/lib/prisma'

// import prisma from "@/pages/api/_lib/prisma";



// update the plans
export async function updatePlan(planId, userId) {
  const saveCreditPoint = await prisma.plan.update({
    where: {
      id: planData[0].id, // Assuming you only have one plan per user
      userId: session.user.id
    },
    data: {
      remainingPoints: {
        decrement: 1
      }
    },
  }).catch(err => {
    console.error('Error creating Plan:', err);
  })
  return saveCreditPoint
}


export async function createHistory(data) {
  // Gets single active plan by ID
  const createHistory = await prisma.history.create({
    data: data
  }).catch(err => {
    console.error('Error creating Plan:', err);
  });
  return createHistory

}
// Take refrence for data to create history
// {
//   userId: session.user.id,
//   model: jsonFinalResponse.model,
//   status: jsonFinalResponse.status,
//   createdAt: jsonFinalResponse.created_at,
//   replicateId: jsonFinalResponse.id
// }

export async function getUserPlan(userId) {
  // Gets all active plans for user
  try {
    if (!userId) {
      console.log('getUserPlan: No userId provided');
      return [];
    }

    // Ensure userId is a string and not undefined
    const userIdString = String(userId);
    console.log('getUserPlan - Original userId:', userId, 'Converted userId:', userIdString);

    let planData = await prisma.plan.findMany({
      where: {
        userId: userIdString,
      }
    });
    
    console.log('getUserPlan - Query result:', planData);
    console.log('getUserPlan - Number of plans found:', planData?.length || 0);
    
    // Ensure we always return an array
    return planData || [];
  } catch (err) {
    console.error('Error fetching user plan:', err);
    console.error('Error details:', err.message);
    return []; // Return empty array instead of undefined
  }
}

